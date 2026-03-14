import ContextCompressor from './core/compressor.js';
import SessionManager from './core/session-manager.js';
import QwenClient from './api/qwen.js';
import config from '../config/index.js';

/**
 * Context Compression MVP
 * Main entry point - integrates compression, session management, and Qwen API
 */

class ContextCompressionMVP {
  constructor(options = {}) {
    // Initialize components
    this.qwen = new QwenClient(options.qwen);
    this.compressor = new ContextCompressor(options.compressor);
    this.sessionManager = new SessionManager(options.sessionManager);
    
    // Compression trigger threshold
    this.compressionThreshold = options.compressionThreshold || config.app.maxContextLength;
    
    console.log('Context Compression MVP initialized');
    console.log(`  - Qwen Model: ${config.qwen.model}`);
    console.log(`  - Max Context Length: ${config.app.maxContextLength}`);
    console.log(`  - Compression Ratio: ${config.app.compressionRatio}`);
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
      
      return {
        sessionId,
        context: result.context,
        compressed: true,
        summary: result.summary,
        keyInfo: result.keyInfo,
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
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const qwenHealth = await this.qwen.healthCheck();
    
    return {
      status: 'ok',
      timestamp: Date.now(),
      components: {
        qwen: qwenHealth ? 'healthy' : 'degraded',
        compressor: 'healthy',
        sessionManager: 'healthy',
      },
      config: {
        model: config.qwen.model,
        maxContextLength: config.app.maxContextLength,
      },
    };
  }
}

// Export for use
export default ContextCompressionMVP;

// Also export individual components for advanced usage
export { ContextCompressor, SessionManager, QwenClient, config };
