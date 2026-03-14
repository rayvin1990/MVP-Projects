import { ChromaClient, Collection } from 'chromadb';
import config from '../../config/index.js';

/**
 * ChromaDB Vector Store Integration
 * Handles vector storage and similarity search for context retrieval
 */

class VectorStore {
  constructor(options = {}) {
    this.client = null;
    this.collection = null;
    this.collectionName = options.collectionName || 'context_embeddings';
    this.embeddings = [];
    this.isInitialized = false;
  }

  /**
   * Initialize ChromaDB connection
   * For MVP, we use in-memory storage (no persistent server required)
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Initialize ChromaDB client
      // For local MVP, we'll use a simple in-memory approach
      // In production, connect to a ChromaDB server
      this.client = new ChromaClient({
        path: config.chroma.path,
      });

      // Create or get collection
      try {
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata: {
            description: 'Context compression embeddings',
            createdAt: Date.now(),
          },
        });
        console.log(`Created ChromaDB collection: ${this.collectionName}`);
      } catch (error) {
        // Collection already exists, get it
        this.collection = await this.client.getCollection({
          name: this.collectionName,
        });
        console.log(`Using existing ChromaDB collection: ${this.collectionName}`);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('ChromaDB initialization failed, falling back to in-memory storage:', error.message);
      // Fallback to in-memory storage for MVP
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Generate embeddings for text
   * Uses a simple embedding strategy for MVP
   * In production, integrate with actual embedding API (e.g., text-embedding-3-small)
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(text) {
    // MVP: Simple hash-based embedding (placeholder)
    // TODO: Integrate with actual embedding API
    const embedding = this._simpleEmbedding(text);
    return embedding;
  }

  /**
   * Simple embedding function for MVP
   * Creates a deterministic vector based on text content
   * @param {string} text - Input text
   * @param {number} dimensions - Vector dimensions (default 384)
   * @returns {Array<number>} Embedding vector
   */
  _simpleEmbedding(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0);
    
    // Simple hash-based approach for MVP
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode + i) % dimensions;
      embedding[index] += (charCode / 255) * Math.sin(i);
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  /**
   * Add text to vector store with metadata
   * @param {string} id - Unique identifier
   * @param {string} text - Text to store
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<boolean>} Success status
   */
  async addText(id, text, metadata = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const embedding = await this.generateEmbedding(text);
      
      if (this.collection) {
        await this.collection.add({
          ids: [id],
          embeddings: [embedding],
          metadatas: [{
            text,
            timestamp: Date.now(),
            ...metadata,
          }],
        });
      } else {
        // In-memory fallback
        this.embeddings.push({
          id,
          embedding,
          metadata: {
            text,
            timestamp: Date.now(),
            ...metadata,
          },
        });
      }

      console.log(`Added embedding for: ${id}`);
      return true;
    } catch (error) {
      console.error('Failed to add text to vector store:', error);
      return false;
    }
  }

  /**
   * Add multiple texts in batch
   * @param {Array<Object>} items - Array of {id, text, metadata}
   * @returns {Promise<boolean>} Success status
   */
  async addBatch(items) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const ids = [];
      const embeddings = [];
      const metadatas = [];

      for (const item of items) {
        ids.push(item.id);
        const embedding = await this.generateEmbedding(item.text);
        embeddings.push(embedding);
        metadatas.push({
          text: item.text,
          timestamp: Date.now(),
          ...item.metadata,
        });
      }

      if (this.collection) {
        await this.collection.add({
          ids,
          embeddings,
          metadatas,
        });
      } else {
        // In-memory fallback
        for (let i = 0; i < items.length; i++) {
          this.embeddings.push({
            id: ids[i],
            embedding: embeddings[i],
            metadata: metadatas[i],
          });
        }
      }

      console.log(`Added ${items.length} embeddings in batch`);
      return true;
    } catch (error) {
      console.error('Failed to add batch to vector store:', error);
      return false;
    }
  }

  /**
   * Search for similar texts
   * @param {string} query - Query text
   * @param {number} limit - Number of results (default 5)
   * @returns {Promise<Array>} Similar items with scores
   */
  async search(query, limit = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);

      if (this.collection) {
        const results = await this.collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: limit,
          include: ['metadatas', 'distances'],
        });

        return this._formatResults(results);
      } else {
        // In-memory fallback: cosine similarity search
        return this._cosineSimilaritySearch(queryEmbedding, limit);
      }
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }

  /**
   * Format ChromaDB results
   * @param {Object} results - ChromaDB query results
   * @returns {Array} Formatted results
   */
  _formatResults(results) {
    if (!results.ids || !results.ids[0]) return [];

    const formatted = [];
    for (let i = 0; i < results.ids[0].length; i++) {
      formatted.push({
        id: results.ids[0][i],
        text: results.metadatas[0][i]?.text || '',
        score: 1 - (results.distances[0][i] || 0), // Convert distance to similarity
        metadata: results.metadatas[0][i],
      });
    }
    return formatted;
  }

  /**
   * Cosine similarity search (in-memory fallback)
   * @param {Array<number>} queryEmbedding - Query vector
   * @param {number} limit - Number of results
   * @returns {Array} Similar items
   */
  _cosineSimilaritySearch(queryEmbedding, limit) {
    const results = this.embeddings.map(item => {
      const similarity = this._cosineSimilarity(queryEmbedding, item.embedding);
      return {
        id: item.id,
        text: item.metadata.text,
        score: similarity,
        metadata: item.metadata,
      };
    });

    // Sort by similarity (descending)
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} a - Vector A
   * @param {Array<number>} b - Vector B
   * @returns {number} Similarity score (0-1)
   */
  _cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Delete an item from the vector store
   * @param {string} id - Item ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      if (this.collection) {
        await this.collection.delete({ ids: [id] });
      } else {
        this.embeddings = this.embeddings.filter(item => item.id !== id);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete from vector store:', error);
      return false;
    }
  }

  /**
   * Clear all items from the vector store
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      if (this.collection) {
        await this.collection.delete({ where: {} });
      } else {
        this.embeddings = [];
      }
      console.log('Vector store cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear vector store:', error);
      return false;
    }
  }

  /**
   * Get statistics about the vector store
   * @returns {Promise<Object>} Stats
   */
  async getStats() {
    try {
      let count = 0;
      if (this.collection) {
        const collection = await this.client.getCollection({ name: this.collectionName });
        count = await collection.count();
      } else {
        count = this.embeddings.length;
      }

      return {
        itemCount: count,
        collectionName: this.collectionName,
        isInitialized: this.isInitialized,
        hasChromaDB: !!this.collection,
      };
    } catch (error) {
      console.error('Failed to get vector store stats:', error);
      return {
        itemCount: this.embeddings.length,
        collectionName: this.collectionName,
        isInitialized: this.isInitialized,
        hasChromaDB: false,
        error: error.message,
      };
    }
  }
}

export default VectorStore;
