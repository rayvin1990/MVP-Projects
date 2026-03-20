const axios = require('axios');

const API_KEY = 'DEEPSEEK_API_KEY_PLACEHOLDER';

async function testAPI() {
  console.log('测试 API Key 状�?..\n');
  
  // 测试 1: 简单请�?  console.log('1. 简单请求测�?');
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 15000
    });
    console.log(`�?成功: ${JSON.stringify(response.data.choices[0].message)}\n`);
  } catch (error) {
    console.log(`�?失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}\n`);
  }
  
  // 测试 2: 中文请求
  console.log('2. 中文请求测试:');
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: '你好' }],
      max_tokens: 20
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 15000
    });
    console.log(`�?成功�?{response.data.choices[0].message.content}\n`);
  } catch (error) {
    console.log(`�?失败�?{error.response?.status} - ${error.response?.data?.error?.message || error.message}\n`);
  }
  
  // 测试 3: 长请�?  console.log('3. 长请求测�?(口红):');
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: '推荐口红颜色' }],
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 30000
    });
    console.log(`�?成功�?{response.data.choices[0].message.content.substring(0, 50)}...\n`);
  } catch (error) {
    console.log(`�?失败�?{error.response?.status} - ${error.response?.data?.error?.message || error.message}\n`);
  }
}

testAPI().catch(console.error);
