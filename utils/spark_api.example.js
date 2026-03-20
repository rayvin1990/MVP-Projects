/**
 * 讯飞星火 API 使用示例
 */

const sparkApi = require('./spark_api');

// ============================================
// 示例 1: 流式对话（推荐用于实时显示）
// ============================================
console.log('示例 1: 流式对话');

sparkApi.chat('今天适合画什么妆容？', {
  onMessage: (chunk, full) => {
    // 实时显示每个字
    process.stdout.write(chunk);
  },
  onComplete: (fullResponse) => {
    console.log('\n\n完整回复:', fullResponse);
  },
  onError: (error) => {
    console.error('错误:', error.message);
  }
});

// ============================================
// 示例 2: Promise 版本（一次性获取完整回复）
// ============================================
async function example2() {
  console.log('\n示例 2: Promise 版本');
  
  try {
    const response = await sparkApi.chatAsync('推荐一款适合夏天的口红');
    console.log('AI 回复:', response);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// example2();

// ============================================
// 示例 3: 带历史记录的对话
// ============================================
function example3() {
  console.log('\n示例 3: 带历史记录的对话');
  
  const messages = [
    { role: 'system', content: '你是妆妹，一个 AI 美妆闺蜜。' },
    { role: 'user', content: '我是油皮，有什么推荐？' },
    { role: 'assistant', content: '油皮建议选择控油持妆的粉底液哦～' },
    { role: 'user', content: '具体哪个品牌？' }
  ];
  
  sparkApi.chatWithHistory(messages, {
    onMessage: (chunk) => {
      process.stdout.write(chunk);
    },
    onComplete: (full) => {
      console.log('\n完整回复:', full);
    },
    onError: (error) => {
      console.error('错误:', error);
    }
  });
}

// example3();

// ============================================
// 示例 4: 自定义系统提示词
// ============================================
function example4() {
  console.log('\n示例 4: 自定义系统提示词');
  
  sparkApi.chat('你好', {
    systemPrompt: '你是一个专业的美妆顾问，提供科学、专业的护肤建议。',
    onMessage: (chunk) => {
      process.stdout.write(chunk);
    },
    onComplete: (full) => {
      console.log('\n完整回复:', full);
    },
    onError: (error) => {
      console.error('错误:', error);
    }
  });
}

// example4();
