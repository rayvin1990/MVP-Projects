/**
 * 妆妹小程序 - DeepSeek V3 配置测试
 * 
 * 测试内容：
 * 1. 发送"推荐一个口红颜色"
 * 2. 验证回复符合闺蜜人设
 * 3. 验证语气温柔亲切
 * 4. 验证有 emoji
 * 5. 验证回复简短（<200 字）
 */

const { chatAsync, setApiKey, CONFIG } = require('./deepseek.js');

// 闺蜜人设 System Prompt
const SYSTEM_PROMPT = `你是妆妹，用户的 AI 美妆闺蜜。

人设特点：
1. 温柔亲切，像好姐妹一样说话
2. 多用语气词（呀、呢、～、💕）
3. 多夸赞，少批评
4. 情感丰富，会安慰人
5. 美妆建议专业但接地气

说话风格示例：
- ❌ "这个颜色不适合你"
- ✅ "这个颜色有点挑皮哦，试试豆沙色可能更衬你～💕"

- ❌ "你的底妆有问题"
- ✅ "底妆整体很好！鼻翼稍微按压一下就完美啦～"

回复原则：
1. 先夸再建议（如果有建议）
2. 多用 emoji（💄💕✨😊🌟）
3. 简短温暖，不要长篇大论（<200 字）
4. 像聊天，不要像教科书
5. 用户心情不好时，先安慰再给建议`;

async function runTest() {
  console.log('🧪 开始测试妆妹 DeepSeek V3 配置...\n');
  console.log('📋 测试问题："推荐一个口红颜色"\n');
  console.log('⚙️  当前配置:');
  console.log(`   - Model: ${CONFIG.model}`);
  console.log(`   - Temperature: 0.8`);
  console.log(`   - Max Tokens: 512`);
  console.log(`   - API Key: ${CONFIG.apiKey.substring(0, 10)}...\n`);
  
  try {
    const startTime = Date.now();
    
    const reply = await chatAsync('推荐一个口红颜色', {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.8,
      max_tokens: 512
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ 收到回复:\n');
    console.log('─'.repeat(50));
    console.log(reply);
    console.log('─'.repeat(50));
    
    // 验证
    console.log('\n📊 验证结果:\n');
    
    // 1. 检查回复长度
    const charCount = reply.length;
    const lengthOk = charCount < 200;
    console.log(`1. 回复长度：${charCount} 字 ${lengthOk ? '✅ (<200 字)' : '❌ (超过 200 字)'}`);
    
    // 2. 检查是否有 emoji
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(reply);
    console.log(`2. 包含 emoji: ${hasEmoji ? '✅' : '❌'}`);
    
    // 3. 检查是否有语气词
    const hasToneWords = /[呀呢哦嘛啦～~]/.test(reply);
    console.log(`3. 包含语气词：${hasToneWords ? '✅' : '❌'}`);
    
    // 4. 检查是否温柔（没有批评性词汇）
    const negativeWords = /[不适合不行不好有问题]/g;
    const hasNegative = negativeWords.test(reply);
    console.log(`4. 语气温柔（无批评）: ${!hasNegative ? '✅' : '⚠️  (包含批评性词汇)'}`);
    
    // 5. 响应时间
    console.log(`5. 响应时间：${responseTime}ms`);
    
    // 总结
    console.log('\n' + '='.repeat(50));
    const allPassed = lengthOk && hasEmoji && hasToneWords && !hasNegative;
    if (allPassed) {
      console.log('🎉 测试通过！妆妹闺蜜人设配置成功！');
    } else {
      console.log('⚠️  部分验证未通过，但配置已生效');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
runTest();
