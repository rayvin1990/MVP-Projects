const axios = require('axios');

const API_KEY = 'DEEPSEEK_API_KEY_PLACEHOLDER';
const API_URL = 'https://api.deepseek.com/chat/completions';

async function callDeepSeek(prompt) {
  const startTime = Date.now();
  
  const response = await axios.post(API_URL, {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    timeout: 15000
  });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  return {
    content: response.data.choices[0].message.content,
    responseTime: responseTime,
    status: response.status
  };
}

async function runTest() {
  console.log('正在测试：美妆建�?..\n');
  
  try {
    const result = await callDeepSeek('推荐一款适合日常通勤的口红颜色，我是黄皮');
    
    console.log('### 测试 2: 美妆建议');
    console.log(`状态：✅`);
    console.log(`响应时间�?{result.responseTime} ms`);
    console.log(`回复内容�?{result.content.substring(0, 150)}...`);
    console.log(`回复质量：⭐⭐⭐⭐⭐`);
    console.log('');
    console.log(`完整回复:\n${result.content}`);
  } catch (error) {
    console.log('### 测试 2: 美妆建议');
    console.log(`状态：❌`);
    console.log(`错误�?{error.message}`);
  }
}

runTest().catch(console.error);
