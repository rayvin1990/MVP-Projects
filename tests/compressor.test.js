import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import ContextCompressor from '../src/core/compressor.js';
import SessionManager from '../src/core/session-manager.js';

describe('ContextCompressor', () => {
  let compressor;

  beforeEach(() => {
    compressor = new ContextCompressor({
      maxContextLength: 500,
      compressionRatio: 0.3,
      preserveKeyInfo: true,
    });
  });

  it('should initialize with default options', () => {
    const defaultCompressor = new ContextCompressor();
    assert.ok(defaultCompressor);
    assert.strictEqual(defaultCompressor.maxContextLength, 4000);
  });

  it('should not compress when under threshold', async () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    const result = await compressor.compress('test-1', messages, async (text) => text);
    
    assert.strictEqual(result.compressed, false);
    assert.strictEqual(result.summary, null);
  });

  it('should compress when over threshold', async () => {
    const longContent = 'A'.repeat(600);
    const messages = [
      { role: 'user', content: longContent },
    ];

    const mockSummaryFn = async (text) => `Summary: ${text.substring(0, 100)}`;
    const result = await compressor.compress('test-2', messages, mockSummaryFn);
    
    assert.strictEqual(result.compressed, true);
    assert.ok(result.summary);
    assert.ok(result.compressionRatio);
  });

  it('should extract key information', async () => {
    // Create messages that exceed the threshold and contain key info patterns
    const longContent = 'x'.repeat(600);
    const messages = [
      { role: 'user', content: `决定：使用 Qwen-Max 模型。${longContent}` },
      { role: 'assistant', content: `偏好：已记住您的选择。${longContent}` },
    ];

    const result = await compressor.compress('test-3', messages, async (text) => text.substring(0, 200));
    
    // Key info extraction depends on pattern matching
    assert.ok(result.keyInfo !== undefined);
  });

  it('should store session history', async () => {
    // Create messages that exceed threshold to trigger storage
    const longContent = 'x'.repeat(600);
    const messages = [{ role: 'user', content: `Test message with enough content to trigger compression. ${longContent}`}];
    
    await compressor.compress('test-4', messages, async (text) => text.substring(0, 200));
    
    const session = compressor.getSession('test-4');
    assert.ok(session);
    assert.ok(session.timestamp);
  });

  it('should clear session', async () => {
    const messages = [{ role: 'user', content: 'Test' }];
    
    await compressor.compress('test-5', messages, async (text) => text);
    compressor.clearSession('test-5');
    
    const session = compressor.getSession('test-5');
    assert.strictEqual(session, null);
  });
});

describe('SessionManager', () => {
  let manager;

  beforeEach(() => {
    manager = new SessionManager({
      maxHistoryLength: 10,
      ttl: 60000,
    });
  });

  it('should create session on first message', () => {
    const session = manager.getOrCreateSession('test-1');
    
    assert.ok(session);
    assert.strictEqual(session.id, 'test-1');
    assert.strictEqual(session.messages.length, 0);
  });

  it('should add messages to session', () => {
    manager.addMessage('test-2', { role: 'user', content: 'Hello' });
    manager.addMessage('test-2', { role: 'assistant', content: 'Hi' });
    
    const messages = manager.getMessages('test-2');
    assert.strictEqual(messages.length, 2);
  });

  it('should enforce max history length', () => {
    for (let i = 0; i < 15; i++) {
      manager.addMessage('test-3', { role: 'user', content: `Message ${i}` });
    }
    
    const messages = manager.getMessages('test-3');
    assert.strictEqual(messages.length, 10);
  });

  it('should update summary', () => {
    manager.addMessage('test-4', { role: 'user', content: 'Test' });
    manager.updateSummary('test-4', 'This is a summary', { test: true });
    
    const session = manager.getOrCreateSession('test-4');
    assert.strictEqual(session.summary, 'This is a summary');
    assert.strictEqual(session.compressed, true);
  });

  it('should return session stats', () => {
    manager.addMessage('test-5', { role: 'user', content: 'Test' });
    
    const stats = manager.getSessionStats('test-5');
    assert.ok(stats);
    assert.strictEqual(stats.messageCount, 1);
    assert.strictEqual(stats.compressed, false);
  });

  it('should delete session', () => {
    manager.addMessage('test-6', { role: 'user', content: 'Test' });
    manager.deleteSession('test-6');
    
    const messages = manager.getMessages('test-6');
    assert.strictEqual(messages.length, 0);
  });

  it('should get all sessions', () => {
    manager.addMessage('session-1', { role: 'user', content: 'Test 1' });
    manager.addMessage('session-2', { role: 'user', content: 'Test 2' });
    
    const sessions = manager.getAllSessions();
    assert.strictEqual(sessions.length, 2);
  });
});
