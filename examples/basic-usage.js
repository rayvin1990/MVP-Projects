/**
 * Example usage of Context Compression MVP
 * 
 * Run with: node examples/basic-usage.js
 */

import ContextCompressionMVP from '../src/index.js';

// Mock Qwen API for demo (replace with real API in production)
class MockQwenClient {
  async summarize(text, maxLength) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple mock summary
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.max(1, Math.floor(sentences.length * 0.3))).join('. ') + '.';
    return summary.slice(0, maxLength);
  }

  async healthCheck() {
    return true;
  }
}

async function demo() {
  console.log('=== Context Compression MVP Demo ===\n');

  // Initialize with mock Qwen client
  const app = new ContextCompressionMVP({
    compressionThreshold: 500, // Lower threshold for demo
    qwen: {
      apiKey: 'mock-key', // Won't be used with mock client
    },
  });

  // Replace real Qwen client with mock
  app.qwen = new MockQwenClient();

  const sessionId = 'demo-session-1';

  // Simulate a conversation
  const conversation = [
    { role: 'user', content: '你好，我想创建一个 AI 助手项目。' },
    { role: 'assistant', content: '好的！请问您需要什么类型的 AI 助手？是对话型、任务型还是分析型？' },
    { role: 'user', content: '我需要一个对话型助手，能够帮助我管理日常任务和日程。' },
    { role: 'assistant', content: '明白了。我会帮您设计一个对话型任务管理助手。我们需要考虑以下功能：任务创建、日程安排、提醒功能、优先级管理等。' },
    { role: 'user', content: '很好，我还希望它能够记住我的偏好，比如我喜欢早上处理重要任务。' },
    { role: 'assistant', content: '已记录您的偏好：早上处理重要任务。这将成为助手的个性化配置之一。' },
    { role: 'user', content: '另外，我需要它能够与我的日历同步，并且支持语音输入。' },
    { role: 'assistant', content: '好的，日历同步和语音输入是重要的功能需求。我们还需要考虑使用哪个日历服务（Google Calendar、Outlook 等）以及语音识别引擎。' },
    { role: 'user', content: '使用 Google Calendar 和 Whisper 语音识别。' },
    { role: 'assistant', content: '已记录技术栈偏好：Google Calendar + Whisper。现在让我为您总结项目需求...'.repeat(50) }, // Make it long to trigger compression
  ];

  console.log('Processing conversation...\n');

  // Process each turn
  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log(`${message.role}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`);

    const result = await app.processTurn(sessionId, message);

    if (result.compressed) {
      console.log('\n📦 CONTEXT COMPRESSED!');
      console.log(`   Original: ${result.stats.originalLength} chars`);
      console.log(`   Compressed: ${result.stats.compressedLength} chars`);
      console.log(`   Ratio: ${result.stats.compressionRatio}`);
      console.log(`   Key Info: ${result.keyInfo?.length || 0} items`);
    } else {
      console.log(`   Context length: ${result.stats.currentLength}/${result.stats.threshold} chars`);
    }
  }

  // Get final stats
  console.log('\n\n=== Final Session Stats ===');
  const stats = app.getSessionStats(sessionId);
  console.log(JSON.stringify(stats, null, 2));

  // Health check
  console.log('\n=== Health Check ===');
  const health = await app.healthCheck();
  console.log(JSON.stringify(health, null, 2));

  console.log('\n=== Demo Complete ===');
}

// Run demo
demo().catch(console.error);
