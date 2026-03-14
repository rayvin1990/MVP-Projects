import ContextCompressor from './core/compressor.js';
import SessionManager from './core/session-manager.js';
import QwenClient from './api/qwen.js';
import VectorStore from './utils/vector-store.js';
import EmbeddingService from './utils/embedding-service.js';
import config from '../config/index.js';

/**
 * Context Compression MVP
 * Main entry point - integrates compression, session management, and Qwen API
 * V2.0: Added vector storage and semantic retrieval
 */

class ContextCompressionMVP {
  constructor(options = {}) {
    // Initialize components
    this.qwen = new QwenClient(options.qwen);
    this.compressor = new ContextCompressor({
      ...options.compressor,
      enableVectorRetrieval: options.enableVectorRetrieval !== undefined 
        ? options.enableVectorRetrieval 
        : true,
    });
    this.sessionManager = new SessionManager(options.sessionManager);
    
    // Compression trigger threshold
    this.compressionThreshold = options.compressionThreshold || config.app.maxContextLength;
    
    // Vector store for semantic retrieval
    this.vectorStore = new VectorStore(options.vectorStore);
    this.embeddingService = new EmbeddingService(options.embedding);
    
    console.log('Context Compression MVP initialized (V2.0 with Vector Storage)');
    console.log(`  - Qwen Model: ${config.qwen.model}`);
    console.log(`  - Max Context Length: ${config.app.maxContextLength}`);
    console.log(`  - Compression Ratio: ${config.app.compressionRatio}`);
    console.log(`  - Vector Retrieval: ${options.enableVectorRetrieval !== false ? 'enabled' : 'disabled'}`);
  }

  /**
   * Process a conversation turn with automatic compression
   * @param {string} sessionId - Session identifier
   * @param {Object} newMessage - New message {role, content}
   * @returns {Promise<Object>} Processed result with context
   */
  async processTurn(sessionId, newMessage) {
    // Add message to session
    const session = this.sessionManager.addMessage(sessionId, newMessage);
    
    // Get all messages
    const messages = this.sessionManager.getMessages(sessionId);
    
    // Calculate current context length
    const contextText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
    
    // Check if compression is needed
    if (contextText.length > this.compressionThreshold) {
      console.log(`Context exceeds threshold (${contextText.length} > ${this.compressionThreshold}), compressing...`);
      
      // Compress using Qwen-Max
      const result = await this.compressor.compress(
        sessionId,
        messages,
        (text, maxLength) => this.qwen.summarize(text, maxLength)
      );
      
      // Update session with summary
      this.sessionManager.updateSummary(sessionId, result.summary, {
        originalLength: result.originalLength,
        compressedLength: result.compressedLength,
        compressionRatio: result.compressionRatio,
      });
      
      // Store in vector store for semantic retrieval
      await this.compressor.storeInVectorStore(sessionId, result);
      
      return {
        sessionId,
        context: result.context,
        compressed: true,
        summary: result.summary,
        keyInfo: result.keyInfo,
        vectorStored: true,
        stats: {
          originalLength: result.originalLength,
          compressedLength: result.compressedLength,
          compressionRatio: result.compressionRatio,
          messageCount: result.messageCount,
        },
      };
    }
    
    // No compression needed
    return {
      sessionId,
      context: contextText,
      compressed: false,
      summary: session.summary,
      stats: {
        currentLength: contextText.length,
        threshold: this.compressionThreshold,
        messageCount: messages.length,
      },
    };
  }

  /**
   * Get current context for a session
   * @param {string} sessionId - Session ID
   * @returns {Object} Context object
   */
  getContext(sessionId) {
    const session = this.sessionManager.getOrCreateSession(sessionId);
    const messages = this.sessionManager.getMessages(sessionId);
    
    if (session.compressed && session.summary) {
      return {
        sessionId,
        context: session.summary,
        compressed: true,
        messageCount: messages.length,
      };
    }
    
    const contextText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
    
    return {
      sessionId,
      context: contextText,
      compressed: false,
      messageCount: messages.length,
    };
  }

  /**
   * Add a message without triggering compression
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message object
   */
  addMessage(sessionId, message) {
    return this.sessionManager.addMessage(sessionId, message);
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Stats
   */
  getSessionStats(sessionId) {
    return this.sessionManager.getSessionStats(sessionId);
  }

  /**
   * Get all sessions
   * @returns {Array} Session list
   */
  getAllSessions() {
    return this.sessionManager.getAllSessions();
  }

  /**
   * Clear a session
   * @param {string} sessionId - Session ID
   */
  clearSession(sessionId) {
    this.sessionManager.clearMessages(sessionId);
    this.compressor.clearSession(sessionId);
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   */
  deleteSession(sessionId) {
    this.sessionManager.deleteSession(sessionId);
    this.compressor.clearSession(sessionId);
  }

  /**
   * Retrieve relevant context using semantic search
   * @param {string} query - Search query
   * @param {string} sessionId - Optional session ID filter
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Relevant context items
   */
  async retrieveContext(query, sessionId = null, limit = 5) {
    return await this.compressor.retrieveContext(query, sessionId, limit);
  }

  /**
   * Get vector store statistics
   * @returns {Promise<Object>} Stats
   */
  async getVectorStoreStats() {
    return await this.compressor.getVectorStoreStats();
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const qwenHealth = await this.qwen.healthCheck();
    const embeddingHealth = await this.embeddingService.healthCheck();
    const vectorStoreStats = await this.compressor.getVectorStoreStats();
    
    return {
      status: 'ok',
      timestamp: Date.now(),
      version: '2.0.0',
      components: {
        qwen: qwenHealth ? 'healthy' : 'degraded',
        compressor: 'healthy',
        sessionManager: 'healthy',
        embedding: embeddingHealth.status,
        vectorStore: vectorStoreStats.isInitialized ? 'healthy' : 'degraded',
      },
      vectorStore: vectorStoreStats,
      config: {
        model: config.qwen.model,
        maxContextLength: config.app.maxContextLength,
        embeddingModel: config.embedding.model,
      },
    };
  }
}

// Export for use
export default ContextCompressionMVP;

// Also export individual components for advanced usage
export { ContextCompressor, SessionManager, QwenClient, VectorStore, EmbeddingService, config };
