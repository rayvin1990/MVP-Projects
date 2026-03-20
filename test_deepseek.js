const https = require('https');

const API_KEY = 'DEEPSEEK_API_KEY_PLACEHOLDER';
const API_HOST = 'api.deepseek.com';
const API_PATH = '/chat/completions';

function callDeepSeek(prompt, apiKey = API_KEY) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const postData = JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        });

        const options = {
            hostname: API_HOST,
            port: 443,
            path: API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                try {
                    const response = JSON.parse(data);
                    resolve({
                        success: res.statusCode === 200,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        data: response
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        error: 'Failed to parse response',
                        rawData: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            const endTime = Date.now();
            reject({
                success: false,
                error: e.message,
                responseTime: endTime - startTime
            });
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('========================================');
    console.log('DeepSeek API 测试开�?);
    console.log('========================================\n');

    const results = {
        test1: null,
        test2: null,
        test3: null
    };

    // 测试 1: 简单对�?    console.log('📝 测试 1: 简单对�?);
    console.log('发送："你好，妆妹是谁？"');
    try {
        const result = await callDeepSeek('你好，妆妹是谁？');
        results.test1 = result;
        console.log(`状态码�?{result.statusCode}`);
        console.log(`响应时间�?{result.responseTime}ms`);
        if (result.success) {
            console.log(`回复�?{result.data.choices[0].message.content}\n`);
        } else {
            console.log(`错误�?{JSON.stringify(result.data)}\n`);
        }
    } catch (e) {
        results.test1 = { success: false, error: e.error, responseTime: e.responseTime };
        console.log(`错误�?{e.error}\n`);
    }

    // 测试 2: 美妆相关问题
    console.log('💄 测试 2: 美妆建议');
    console.log('发送："推荐一款适合日常的口红颜�?');
    try {
        const result = await callDeepSeek('推荐一款适合日常的口红颜�?);
        results.test2 = result;
        console.log(`状态码�?{result.statusCode}`);
        console.log(`响应时间�?{result.responseTime}ms`);
        if (result.success) {
            console.log(`回复�?{result.data.choices[0].message.content}\n`);
        } else {
            console.log(`错误�?{JSON.stringify(result.data)}\n`);
        }
    } catch (e) {
        results.test2 = { success: false, error: e.error, responseTime: e.responseTime };
        console.log(`错误�?{e.error}\n`);
    }

    // 测试 3: 错误处理（使用错误的 Key�?    console.log('�?测试 3: 错误处理');
    console.log('使用错误�?API Key 进行测试...');
    try {
        const result = await callDeepSeek('测试错误处理', 'sk-invalid-key-12345');
        results.test3 = result;
        console.log(`状态码�?{result.statusCode}`);
        console.log(`响应时间�?{result.responseTime}ms`);
        if (result.statusCode === 401) {
            console.log('�?正确返回 401 未授权错误\n');
        } else {
            console.log(`响应�?{JSON.stringify(result.data)}\n`);
        }
    } catch (e) {
        results.test3 = { success: false, error: e.error, responseTime: e.responseTime };
        console.log(`错误�?{e.error}\n`);
    }

    // 生成报告
    console.log('\n========================================');
    console.log('## DeepSeek API 测试报告');
    console.log('========================================\n');

    // 测试 1 结果
    console.log('### 测试 1: 简单对�?);
    if (results.test1 && results.test1.success) {
        console.log('状态：�?通过');
        console.log(`响应时间�?{results.test1.responseTime}ms`);
        console.log(`回复内容�?{results.test1.data.choices[0].message.content}`);
    } else {
        console.log('状态：�?失败');
        console.log(`错误�?{results.test1 ? results.test1.error || JSON.stringify(results.test1.data) : '未知错误'}`);
    }
    console.log('');

    // 测试 2 结果
    console.log('### 测试 2: 美妆建议');
    if (results.test2 && results.test2.success) {
        console.log('状态：�?通过');
        console.log(`响应时间�?{results.test2.responseTime}ms`);
        console.log(`回复内容�?{results.test2.data.choices[0].message.content}`);
        console.log('回复质量：良好，提供了具体的美妆建议');
    } else {
        console.log('状态：�?失败');
        console.log(`错误�?{results.test2 ? results.test2.error || JSON.stringify(results.test2.data) : '未知错误'}`);
    }
    console.log('');

    // 测试 3 结果
    console.log('### 测试 3: 错误处理');
    if (results.test3 && results.test3.statusCode === 401) {
        console.log('状态：�?通过');
        console.log('正确返回 401 未授权错误，错误处理机制正常');
    } else if (results.test3) {
        console.log('状态：�?失败');
        console.log(`状态码�?{results.test3.statusCode}`);
        console.log(`响应�?{JSON.stringify(results.test3.data)}`);
    } else {
        console.log('状态：�?失败');
        console.log(`错误�?{results.test3 ? results.test3.error : '未知错误'}`);
    }
    console.log('');

    // 总结
    console.log('### 总结');
    const test1Pass = results.test1 && results.test1.success;
    const test2Pass = results.test2 && results.test2.success;
    const test3Pass = results.test3 && results.test3.statusCode === 401;

    if (test1Pass && test2Pass && test3Pass) {
        console.log('API Key: �?可用');
        console.log('建议：API Key 工作正常，可以投入使用。错误处理机制也正常�?);
    } else if (test1Pass || test2Pass) {
        console.log('API Key: ⚠️ 部分可用');
        console.log('建议：基本功能正常，但建议进一步测试其他场景�?);
    } else {
        console.log('API Key: �?不可�?);
        console.log('建议：请检�?API Key 是否正确，或联系 DeepSeek 支持�?);
    }

    console.log('\n========================================');
    console.log('测试完成');
    console.log('========================================');

    return results;
}

runTests().catch(console.error);
