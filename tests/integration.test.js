import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import ContextCompressionMVP from '../src/index.js';

/**
 * Context Compression Integration Tests
 * Tests for the full compression pipeline with vector storage
 */

describe('ContextCompressionMVP - Vector Integration', () => {
  let app;

  before(() => {
    app = new ContextCompressionMVP({
      compressionThreshold: 500, // Low threshold for testing
      enableVectorRetrieval: true,
      compressor: {
        maxContextLength: 4000,
        compressionRatio: 0.3,
        preserveKeyInfo: true,
      },
    });
  });

  describe('Basic Functionality', () => {
    it('should initialize with vector store enabled', () => {
      assert(app !== null);
      assert(app.compressor !== null);
      assert(app.compressor.vectorStore !== null);
    });

    it('should process a simple message without compression', async () => {
      const result = await app.processTurn('test_session_1', {
        role: 'user',
        content: 'Hello, how are you?',
      });

      assert.strictEqual(result.sessionId, 'test_session_1');
      assert.strictEqual(result.compressed, false);
      assert(result.context.includes('Hello'));
    });

    it('should track message count', async () => {
      await app.addMessage('test_session_1', {
        role: 'assistant',
        content: 'I am doing well, thank you!',
      });

      const stats = app.getSessionStats('test_session_1');
      assert(stats !== null);
      assert(stats.messageCount >= 2);
    });
  });

  describe('Vector Store Statistics', () => {
    it('should return vector store stats', async () => {
      const stats = await app.getVectorStoreStats();
      assert(stats.hasOwnProperty('itemCount'));
      assert(stats.hasOwnProperty('collectionName'));
      assert(stats.hasOwnProperty('isInitialized'));
    });

    it('should include vector store in health check', async () => {
      const health = await app.healthCheck();
      assert(health.hasOwnProperty('components'));
      assert(health.components.hasOwnProperty('vectorStore'));
      assert(health.hasOwnProperty('vectorStore'));
    });
  });

  describe('Context Retrieval', () => {
    it('should retrieve context with query', async () => {
      // First, add some content that will be compressed
      for (let i = 0; i < 10; i++) {
        await app.addMessage('test_session_retrieval', {
          role: 'user',
          content: `Message ${i}: This is a test message about topic ${i % 3 === 0 ? 'AI' : i % 3 === 1 ? 'technology' : 'science'}`,
        });
      }

      // Retrieve context
      const results = await app.retrieveContext('AI and technology', 'test_session_retrieval', 3);
      assert(Array.isArray(results));
    });

    it('should handle retrieval with no results gracefully', async () => {
      const results = await app.retrieveContext('xyz123nonexistent', 'nonexistent_session', 5);
      assert(Array.isArray(results));
      assert.strictEqual(results.length, 0);
    });
  });

  describe('Session Management', () => {
    it('should get all sessions', () => {
      const sessions = app.getAllSessions();
      assert(sessions !== null);
    });

    it('should clear a session', () => {
      app.clearSession('test_session_1');
      const stats = app.getSessionStats('test_session_1');
      // Session should be reset or have minimal data
      assert(stats !== null);
    });

    it('should delete a session', () => {
      app.deleteSession('test_session_retrieval');
    });
  });
});

console.log('Context compression integration tests completed ✅');
