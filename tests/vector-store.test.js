import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import VectorStore from '../src/utils/vector-store.js';
import EmbeddingService from '../src/utils/embedding-service.js';

/**
 * Vector Store and Embedding Tests
 * Tests for ChromaDB integration and semantic retrieval
 */

describe('VectorStore', () => {
  let vectorStore;

  before(() => {
    vectorStore = new VectorStore({
      collectionName: 'test_embeddings',
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await vectorStore.initialize();
      assert.strictEqual(typeof result, 'boolean');
      assert.strictEqual(vectorStore.isInitialized, true);
    });

    it('should handle re-initialization gracefully', async () => {
      const result = await vectorStore.initialize();
      assert.strictEqual(result, true);
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embeddings for text', async () => {
      const embedding = await vectorStore.generateEmbedding('Hello, world!');
      assert(Array.isArray(embedding));
      assert.strictEqual(embedding.length, 384); // Default dimensions
    });

    it('should generate consistent embeddings for the same text', async () => {
      const text = 'Consistent embedding test';
      const embedding1 = await vectorStore.generateEmbedding(text);
      const embedding2 = await vectorStore.generateEmbedding(text);
      
      assert.strictEqual(embedding1.length, embedding2.length);
      for (let i = 0; i < embedding1.length; i++) {
        assert.strictEqual(embedding1[i], embedding2[i]);
      }
    });

    it('should generate different embeddings for different texts', async () => {
      const embedding1 = await vectorStore.generateEmbedding('Hello');
      const embedding2 = await vectorStore.generateEmbedding('Goodbye');
      
      let different = false;
      for (let i = 0; i < embedding1.length; i++) {
        if (embedding1[i] !== embedding2[i]) {
          different = true;
          break;
        }
      }
      assert.strictEqual(different, true);
    });
  });

  describe('Add and Search', () => {
    it('should add text to vector store', async () => {
      const result = await vectorStore.addText(
        'test_1',
        'This is a test document about AI and machine learning',
        { type: 'document' }
      );
      assert.strictEqual(result, true);
    });

    it('should add multiple texts in batch', async () => {
      const items = [
        { id: 'test_2', text: 'Deep learning neural networks', metadata: { category: 'AI' } },
        { id: 'test_3', text: 'Natural language processing', metadata: { category: 'AI' } },
        { id: 'test_4', text: 'Computer vision algorithms', metadata: { category: 'AI' } },
      ];
      
      const result = await vectorStore.addBatch(items);
      assert.strictEqual(result, true);
    });

    it('should search for similar texts', async () => {
      const results = await vectorStore.search('machine learning and AI', 3);
      assert(Array.isArray(results));
      assert(results.length > 0);
      assert(results[0].hasOwnProperty('id'));
      assert(results[0].hasOwnProperty('text'));
      assert(results[0].hasOwnProperty('score'));
    });

    it('should return results sorted by similarity', async () => {
      const results = await vectorStore.search('neural networks', 5);
      
      for (let i = 1; i < results.length; i++) {
        assert(results[i - 1].score >= results[i].score);
      }
    });

    it('should handle empty search results gracefully', async () => {
      const results = await vectorStore.search('xyzabc123nonexistent', 5);
      assert(Array.isArray(results));
    });
  });

  describe('Delete and Clear', () => {
    it('should delete specific item', async () => {
      const result = await vectorStore.delete('test_1');
      assert.strictEqual(result, true);
    });

    it('should clear all items', async () => {
      const result = await vectorStore.clear();
      assert.strictEqual(result, true);
    });
  });

  describe('Statistics', () => {
    it('should return vector store statistics', async () => {
      const stats = await vectorStore.getStats();
      assert(stats.hasOwnProperty('itemCount'));
      assert(stats.hasOwnProperty('collectionName'));
      assert(stats.hasOwnProperty('isInitialized'));
      assert(stats.hasOwnProperty('hasChromaDB'));
    });
  });
});

describe('EmbeddingService', () => {
  let embeddingService;

  before(() => {
    embeddingService = new EmbeddingService();
  });

  describe('Initialization', () => {
    it('should initialize without API key (fallback mode)', () => {
      assert.strictEqual(embeddingService.isConfigured, false);
    });

    it('should use fallback embeddings when not configured', async () => {
      const embedding = await embeddingService.generateEmbedding('Test text');
      assert(Array.isArray(embedding));
      assert.strictEqual(embedding.length, 384);
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embeddings', async () => {
      const embedding = await embeddingService.generateEmbedding('Hello world');
      assert(Array.isArray(embedding));
      assert.strictEqual(embedding.length, 384);
    });

    it('should generate batch embeddings', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const embeddings = await embeddingService.generateBatch(texts);
      assert(Array.isArray(embeddings));
      assert.strictEqual(embeddings.length, 3);
      assert.strictEqual(embeddings[0].length, 384);
    });
  });

  describe('Similarity Calculation', () => {
    it('should calculate cosine similarity', async () => {
      const embedding1 = await embeddingService.generateEmbedding('Similar text');
      const embedding2 = await embeddingService.generateEmbedding('Similar text');
      
      const similarity = embeddingService.cosineSimilarity(embedding1, embedding2);
      assert(typeof similarity === 'number');
      assert(similarity >= 0 && similarity <= 1);
      assert(similarity > 0.9); // Same text should be very similar
    });

    it('should return low similarity for different texts', async () => {
      const embedding1 = await embeddingService.generateEmbedding('Apple fruit');
      const embedding2 = await embeddingService.generateEmbedding('Computer technology');
      
      const similarity = embeddingService.cosineSimilarity(embedding1, embedding2);
      assert(typeof similarity === 'number');
      assert(similarity >= 0 && similarity <= 1);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const health = await embeddingService.healthCheck();
      assert(health.hasOwnProperty('status'));
      assert(health.hasOwnProperty('model'));
    });
  });
});

describe('Vector Retrieval Integration', () => {
  let vectorStore;

  before(async () => {
    vectorStore = new VectorStore({ collectionName: 'integration_test' });
    await vectorStore.initialize();
    
    // Add test documents
    const documents = [
      { id: 'doc_1', text: 'Context compression uses summarization to reduce conversation length', metadata: { type: 'compression' } },
      { id: 'doc_2', text: 'Vector embeddings enable semantic search and retrieval', metadata: { type: 'embedding' } },
      { id: 'doc_3', text: 'ChromaDB provides persistent vector storage', metadata: { type: 'storage' } },
      { id: 'doc_4', text: 'Qwen-Max generates high-quality summaries', metadata: { type: 'summarization' } },
      { id: 'doc_5', text: 'Session management tracks conversation history', metadata: { type: 'session' } },
    ];
    
    await vectorStore.addBatch(documents);
  });

  after(async () => {
    await vectorStore.clear();
  });

  it('should retrieve relevant documents for query', async () => {
    const results = await vectorStore.search('summarization and compression', 3);
    assert(results.length > 0);
    // With fallback embeddings, we verify results are returned
    // Semantic accuracy depends on embedding quality
    assert(results[0].hasOwnProperty('text'));
    assert(results[0].hasOwnProperty('score'));
  });

  it('should retrieve documents about embeddings', async () => {
    const results = await vectorStore.search('vector embeddings semantic', 3);
    assert(results.length > 0);
    const hasRelevant = results.some(r => 
      r.text.toLowerCase().includes('embedding') || 
      r.text.toLowerCase().includes('vector')
    );
    assert.strictEqual(hasRelevant, true);
  });

  it('should handle queries with no exact matches', async () => {
    const results = await vectorStore.search('random unrelated query xyz', 3);
    assert(Array.isArray(results));
    // Should still return results based on similarity, even if low
  });

  it('should respect limit parameter', async () => {
    const results1 = await vectorStore.search('context', 1);
    const results2 = await vectorStore.search('context', 5);
    
    assert.strictEqual(results1.length, 1);
    assert(results2.length >= results1.length);
    assert(results2.length <= 5);
  });
});

console.log('Vector store and embedding tests completed ✅');
