import config from '../../config/index.js';

/**
 * Embedding Service
 * Generates vector embeddings using external APIs
 */

class EmbeddingService {
  constructor(options = {}) {
    this.model = options.model || config.embedding.model;
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.warn('Embedding API key not configured. Using fallback embeddings.');
    }
  }

  /**
   * Generate embedding for text
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(text) {
    if (this.isConfigured) {
      try {
        return await this._generateWithAPI(text);
      } catch (error) {
        console.warn('API embedding failed, using fallback:', error.message);
        return this._generateFallback(text);
      }
    }
    return this._generateFallback(text);
  }

  /**
   * Generate embeddings for multiple texts
   * @param {Array<string>} texts - Texts to embed
   * @returns {Promise<Array<Array<number>>>} Embedding vectors
   */
  async generateBatch(texts) {
    if (this.isConfigured) {
      try {
        return await this._generateBatchWithAPI(texts);
      } catch (error) {
        console.warn('Batch API embedding failed, using fallback:', error.message);
        return texts.map(text => this._generateFallback(text));
      }
    }
    return texts.map(text => this._generateFallback(text));
  }

  /**
   * Generate embedding using OpenAI API
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async _generateWithAPI(text) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Generate batch embeddings using OpenAI API
   * @param {Array<string>} texts - Texts to embed
   * @returns {Promise<Array<Array<number>>>} Embedding vectors
   */
  async _generateBatchWithAPI(texts) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data.map(item => item.embedding);
  }

  /**
   * Fallback embedding generation (deterministic hash-based)
   * @param {string} text - Text to embed
   * @param {number} dimensions - Vector dimensions (default 384)
   * @returns {Array<number>} Embedding vector
   */
  _generateFallback(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0);
    
    // Use character codes and positions to create a deterministic vector
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode + i * 7) % dimensions;
      embedding[index] += (charCode / 255) * Math.sin(i * 0.1);
      
      // Also use bigrams for better semantic capture
      if (i < text.length - 1) {
        const bigram = text.charCodeAt(i) * 31 + text.charCodeAt(i + 1);
        const bigramIndex = bigram % dimensions;
        embedding[bigramIndex] += 0.5 * Math.cos(i * 0.05);
      }
    }
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  /**
   * Calculate similarity between two embeddings
   * @param {Array<number>} a - Vector A
   * @param {Array<number>} b - Vector B
   * @returns {number} Cosine similarity (0-1)
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    if (!this.isConfigured) {
      return {
        status: 'degraded',
        message: 'API key not configured, using fallback embeddings',
        model: this.model,
      };
    }

    try {
      await this._generateWithAPI('test');
      return {
        status: 'healthy',
        model: this.model,
        apiConfigured: true,
      };
    } catch (error) {
      return {
        status: 'degraded',
        message: error.message,
        model: this.model,
        apiConfigured: true,
      };
    }
  }
}

export default EmbeddingService;
