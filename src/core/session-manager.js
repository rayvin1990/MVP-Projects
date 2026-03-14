/**
 * Session Manager
 * Handles conversation session lifecycle and history
 */

class SessionManager {
  constructor(options = {}) {
    this.sessions = new Map();
    this.maxHistoryLength = options.maxHistoryLength || 100;
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
  }

  /**
   * Create or get a session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session object
   */
  getOrCreateSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        compressed: false,
        summary: null,
        metadata: {},
      });
    }
    
    return this.sessions.get(sessionId);
  }

  /**
   * Add message to session
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message object {role, content, timestamp?}
   * @returns {Object} Updated session
   */
  addMessage(sessionId, message) {
    const session = this.getOrCreateSession(sessionId);
    
    session.messages.push({
      ...message,
      timestamp: message.timestamp || Date.now(),
    });

    // Enforce max history length
    if (session.messages.length > this.maxHistoryLength) {
      session.messages = session.messages.slice(-this.maxHistoryLength);
    }

    session.updatedAt = Date.now();
    
    return session;
  }

  /**
   * Add multiple messages
   * @param {string} sessionId - Session ID
   * @param {Array} messages - Array of messages
   * @returns {Object} Updated session
   */
  addMessages(sessionId, messages) {
    const session = this.getOrCreateSession(sessionId);
    
    const timestampedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }));

    session.messages.push(...timestampedMessages);

    // Enforce max history length
    if (session.messages.length > this.maxHistoryLength) {
      session.messages = session.messages.slice(-this.maxHistoryLength);
    }

    session.updatedAt = Date.now();
    
    return session;
  }

  /**
   * Get session messages
   * @param {string} sessionId - Session ID
   * @param {Object} options - Options {limit, offset}
   * @returns {Array} Messages
   */
  getMessages(sessionId, options = {}) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return [];
    }

    const { limit, offset } = options;
    let messages = [...session.messages];

    if (offset) {
      messages = messages.slice(offset);
    }

    if (limit) {
      messages = messages.slice(0, limit);
    }

    return messages;
  }

  /**
   * Update session summary
   * @param {string} sessionId - Session ID
   * @param {string} summary - Summary text
   * @param {Object} metadata - Additional metadata
   */
  updateSummary(sessionId, summary, metadata = {}) {
    const session = this.getOrCreateSession(sessionId);
    
    session.summary = summary;
    session.compressed = true;
    session.metadata = {
      ...session.metadata,
      ...metadata,
      lastCompressedAt: Date.now(),
    };
    session.updatedAt = Date.now();
  }

  /**
   * Clear session messages (keep metadata)
   * @param {string} sessionId - Session ID
   */
  clearMessages(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.messages = [];
      session.updatedAt = Date.now();
    }
  }

  /**
   * Delete session
   * @param {string} sessionId - Session ID
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   * @returns {Array} Session list
   */
  getAllSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      messageCount: session.messages.length,
      compressed: session.compressed,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  /**
   * Clean up expired sessions
   */
  cleanup() {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.updatedAt > this.ttl) {
        this.sessions.delete(sessionId);
        console.log(`Session ${sessionId} expired and removed`);
      }
    }
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Stats
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      messageCount: session.messages.length,
      compressed: session.compressed,
      summaryLength: session.summary?.length || 0,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      age: Date.now() - session.createdAt,
    };
  }
}

export default SessionManager;
