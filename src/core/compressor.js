import config from '../config/index.js';

/**
 * Context Compression Core Module
 * Handles summary-based compression of AI conversation context
 * MVP: Single agent, summary compression, key info preservation
 */

class ContextCompressor {
  constructor(options = {}) {
    this.maxContextLength = options.maxContextLength || config.app.maxContextLength;
    this.compressionRatio = options.compressionRatio || config.app.compressionRatio;
    this.preserveKeyInfo = options.preserveKeyInfo !== undefined 
      ? options.preserveKeyInfo 
      : config.app.preserveKeyInfo;
    
    // Session history storage
    this.sessions = new Map();
    
    // Key information to preserve (extracted from conversations)
    this.keyInfo = new Map();
  }

  /**
   * Compress conversation context using summary
   * @param {string} conversationId - Unique conversation identifier
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Function} summaryFn - Async function to call Qwen-Max for summarization
   * @returns {Promise<Object>} Compressed context with summary
   */
  async compress(conversationId, messages, summaryFn) {
    if (!conversationId || !messages) {
      throw new Error('Invalid conversationId or messages');
    }

    // Convert messages to text for processing
    const conversationText = this._messagesToText(messages);
    
    // Check if compression is needed
    if (conversationText.length <= this.maxContextLength) {
      return {
        compressed: false,
        context: conversationText,
        summary: null,
        messageCount: messages.length,
      };
    }

    // Extract key information before compression
    const keyInfo = this.preserveKeyInfo 
      ? await this._extractKeyInfo(messages, summaryFn)
      : [];

    // Generate summary using Qwen-Max
    const summary = await summaryFn(conversationText, this.maxContextLength);

    // Store session history
    this._storeSession(conversationId, {
      originalLength: conversationText.length,
      compressedLength: summary.length,
      summary,
      keyInfo,
      timestamp: Date.now(),
      messageCount: messages.length,
    });

    return {
      compressed: true,
      context: summary,
      summary,
      keyInfo,
      originalLength: conversationText.length,
      compressedLength: summary.length,
      compressionRatio: (summary.length / conversationText.length).toFixed(2),
      messageCount: messages.length,
    };
  }

  /**
   * Add a new message to existing compressed context
   * @param {string} conversationId - Conversation identifier
   * @param {Object} newMessage - New message {role, content}
   * @param {Function} summaryFn - Summary function
   * @returns {Promise<Object>} Updated context
   */
  async addMessage(conversationId, newMessage, summaryFn) {
    const session = this.sessions.get(conversationId);
    
    if (!session) {
      throw new Error(`Session ${conversationId} not found`);
    }

    // Append new message to summary
    const updatedContext = `${session.summary}\n\n[New Message]\n${newMessage.role}: ${newMessage.content}`;
    
    // Check if re-compression is needed
    if (updatedContext.length <= this.maxContextLength) {
      return {
        context: updatedContext,
        needsRecompression: false,
      };
    }

    // Re-compress
    const result = await this.compress(conversationId, 
      [{ role: 'system', content: updatedContext }], 
      summaryFn
    );

    return {
      context: result.context,
      needsRecompression: true,
      ...result,
    };
  }

  /**
   * Extract key information from conversation
   * @param {Array} messages - Conversation messages
   * @param {Function} summaryFn - Summary function
   * @returns {Promise<Array>} Key information items
   */
  async _extractKeyInfo(messages, summaryFn) {
    // Simple extraction: look for patterns like decisions, facts, preferences
    const keyPatterns = [
      /决定[:：]\s*(.+)/i,
      /重要[:：]\s*(.+)/i,
      /记住[:：]\s*(.+)/i,
      /偏好[:：]\s*(.+)/i,
      /需求[:：]\s*(.+)/i,
    ];

    const keyInfo = [];
    
    for (const message of messages) {
      if (message.role === 'user' || message.role === 'assistant') {
        for (const pattern of keyPatterns) {
          const match = message.content.match(pattern);
          if (match) {
            keyInfo.push({
              type: 'key_point',
              content: match[1].trim(),
              source: message.role,
              timestamp: Date.now(),
            });
          }
        }
      }
    }

    return keyInfo;
  }

  /**
   * Convert messages array to text
   * @param {Array} messages - Messages array
   * @returns {string} Text representation
   */
  _messagesToText(messages) {
    return messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Store session metadata
   * @param {string} conversationId - Conversation ID
   * @param {Object} data - Session data
   */
  _storeSession(conversationId, data) {
    this.sessions.set(conversationId, {
      ...data,
      history: this.sessions.get(conversationId)?.history || [],
    });
    
    // Keep last 10 compression events
    const session = this.sessions.get(conversationId);
    session.history.push(data);
    if (session.history.length > 10) {
      session.history.shift();
    }
  }

  /**
   * Get session history
   * @param {string} conversationId - Conversation ID
   * @returns {Object|null} Session data
   */
  getSession(conversationId) {
    return this.sessions.get(conversationId) || null;
  }

  /**
   * Clear session
   * @param {string} conversationId - Conversation ID
   */
  clearSession(conversationId) {
    this.sessions.delete(conversationId);
  }

  /**
   * Get all sessions
   * @returns {Map} All sessions
   */
  getAllSessions() {
    return this.sessions;
  }
}

export default ContextCompressor;
