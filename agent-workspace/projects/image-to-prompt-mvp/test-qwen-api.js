// Qwen API 测试脚本
const API_CONFIG = {
  apiKey: 'DASHSCOPE_API_KEY_PLACEHOLDER',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-vl-plus',
  endpoint: '/chat/completions',
};

// 测试 Qwen API
async function testQwenAPI() {
  console.log('开始测�?Qwen API...');
  console.log('API Key:', API_CONFIG.apiKey.substring(0, 8) + '...');
  console.log('Model:', API_CONFIG.model);

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: '你好，请用一句话介绍你自己�?,
          },
        ],
      }),
    });

    console.log('响应状�?', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('API 响应:', JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content;
    console.log('\n�?API 调用成功�?);
    console.log('回复:', reply);
    return true;

  } catch (error) {
    console.error('�?API 调用失败:', error);
    return false;
  }
}

// 运行测试
testQwenAPI().then(success => {
  if (success) {
    console.log('\n�?Qwen API 测试通过，可以集成到项目�?);
  } else {
    console.log('\n�?Qwen API 测试失败，请检�?API Key 和配�?);
  }
});
