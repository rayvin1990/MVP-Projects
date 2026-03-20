# Perplexity AI Search API 配置指南

**版本:** v1.0  
**日期:** 2026-03-10  
**用途:** 配置 Perplexity API 实现全球数据搜索

---

## 🎯 为什么用 Perplexity API

### 优势

| 优势 | 说明 |
|------|------|
| **全球数据** | 访问 Reddit、Twitter、Product Hunt 等 |
| **无需代理** | API 方式访问，绕过网络限制 |
| **AI 总结** | 自动整理搜索结果，节省分析时间 |
| **实时数据** | 获取最新的内容和趋势 |
| **高质量** | 搜索结果精准，广告少 |

### 适用场景

- ✅ Reddit 痛点挖掘
- ✅ 全球趋势分析
- ✅ 竞品调研
- ✅ SEO 关键词研究
- ✅ 技术文档查询

---

## 🔧 配置步骤

### 1. 获取 API Key

1. 访问 https://www.perplexity.ai
2. 注册/登录账号
3. 进入 Settings → API
4. 创建 API Key
5. 复制保存（格式：`pplx-xxxxxxxxxxxxxxxx`）

### 2. 配置到系统

**方式 A: 环境变量（推荐）**

```bash
# Windows PowerShell
$env:PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxxxxxx"

# 或添加到系统环境变量
setx PERPLEXITY_API_KEY "pplx-xxxxxxxxxxxxxxxx"
```

**方式 B: 配置文件**

在 `config_v3.json` 中添加：

```json
{
  "api_keys": {
    "perplexity": "pplx-xxxxxxxxxxxxxxxx"
  }
}
```

### 3. 验证配置

```bash
# 测试 API 连接
curl https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer pplx-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 📋 使用示例

### Researcher Agent 调用 Perplexity

```python
import requests

def search_reddit_pain_points(query):
    """使用 Perplexity 搜索 Reddit 痛点"""
    
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sonar-pro",
        "messages": [
            {
                "role": "system",
                "content": "你是一个专业的市场研究员，擅长从 Reddit 挖掘用户痛点。请搜索相关内容并总结。"
            },
            {
                "role": "user",
                "content": f"搜索 Reddit 上关于\"{query}\"的讨论，找出用户的主要痛点和抱怨。要求：1.列出高赞问题 2.总结核心痛点 3.提供数据支持"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    response = requests.post(url, headers=headers, json=payload)
    result = response.json()
    
    return result["choices"][0]["message"]["content"]

# 使用示例
pain_points = search_reddit_pain_points("browser bookmark management")
print(pain_points)
```

### 搜索结果示例

```markdown
# Reddit 痛点分析报告

## 搜索查询
"browser bookmark management"

## 高赞讨论

### 1. r/productivity - "How do you manage hundreds of bookmarks?" (2.3K 赞同)
**痛点:**
- 书签太多找不到
- 分类混乱
- 重复书签多

**用户原话:**
> "I have over 500 bookmarks and finding anything is a nightmare"

### 2. r/webdev - "Best tool for organizing bookmarks?" (1.8K 赞同)
**痛点:**
- 现有工具太复杂
- 缺乏智能分类
- 同步功能差

### 3. r/lifehacks - "Bookmark management tips" (956 赞同)
**痛点:**
- 手动整理太费时间
- 需要自动化方案

## 核心痛点总结

| 痛点 | 提及次数 | 紧急度 |
|------|----------|--------|
| 书签太多找不到 | 856 | 🔴 高 |
| 分类混乱 | 642 | 🔴 高 |
| 缺乏智能分类 | 521 | 🟡 中 |
| 重复书签多 | 438 | 🟡 中 |
| 工具太复杂 | 287 | 🟢 低 |

## 数据支持

- 搜索范围：Reddit 过去 12 个月
- 相关帖子：1,256 个
- 总评论数：45,678 条
- 平均赞同数：186
```

---

## 🔄 数据源优先级

### 配置后自动选择

```
步骤 1: 痛点挖掘
├─ 有 Perplexity API → Reddit + Twitter + Product Hunt
│  └─ 优势：全球数据、AI 总结、实时
├─ 无 API 但能上网 → 知乎 + 小红书
│  └─ 优势：国内用户、中文内容
└─ 完全离线 → 用户提供数据
   └─ 优势：精准、可控

步骤 2: SEO 关键词
├─ 有 Perplexity API → Google Trends + Keyword Tool
│  └─ 优势：全球数据、准确
├─ 无 API 但能上网 → 百度指数 + 微信指数
│  └─ 优势：国内数据、免费
└─ 完全离线 → 常见关键词推荐
   └─ 优势：快速、基础可用
```

---

## 📊 API 使用限制

### Perplexity API 限额

| 套餐 | 价格 | 限额 | 适合场景 |
|------|------|------|----------|
| **Free** | $0 | 100 次/小时 | 个人测试、小项目 |
| **Pro** | $20/月 | 1000 次/小时 | 频繁使用 |
| **Enterprise** | 定制 | 无限 | 商业项目 |

### 优化建议

1. **缓存结果** - 相同查询不重复调用
2. **批量查询** - 一次查询多个关键词
3. **合理使用** - 只在必要时调用 API
4. **监控用量** - 定期检查使用量

---

## 🛡️ 安全建议

### API Key 保护

```bash
# ✅ 正确：使用环境变量
export PERPLEXITY_API_KEY="pplx-xxx"

# ❌ 错误：硬编码在代码中
api_key = "pplx-xxx"  # 不要这样做！
```

### 权限控制

- 只授予 Researcher Agent 使用权限
- 设置调用频率限制
- 记录所有 API 调用日志
- 定期轮换 API Key

---

## 📝 配置检查清单

配置完成后检查：

- [ ] API Key 已获取并保存
- [ ] 环境变量已设置
- [ ] 测试连接成功
- [ ] config_v3.json 已更新
- [ ] Researcher Agent 可以调用
- [ ] 调用日志正常
- [ ] 用量监控已配置

---

## 🎯 完整工作流示例

### 使用 Perplexity 的 9 步流程

```
1. Reddit 挖痛点
   └─ Perplexity API → 搜索 Reddit + AI 总结
      ↓
2. SEO 关键词提取
   └─ Perplexity API → Google Trends 数据
      ↓
3. 产品极简设计
   └─ Product Agent → 基于真实数据设计
      ↓
4-9. 后续流程...
   └─ 正常执行
```

### 时间对比

| 阶段 | 传统方式 | Perplexity API | 节省 |
|------|----------|----------------|------|
| 痛点挖掘 | 30 分钟 | 5 分钟 | 83% |
| 数据整理 | 20 分钟 | 自动 | 100% |
| 总计 | 50 分钟 | 5 分钟 | 90% |

---

## 💡 最佳实践

1. **明确查询** - 问题越具体，结果越精准
2. **迭代搜索** - 根据结果调整查询词
3. **验证数据** - 重要数据交叉验证
4. **保存结果** - 缓存有价值的搜索结果
5. **合理配额** - 优先用于关键步骤

---

## 📞 常见问题

**Q: API Key 无效？**
A: 检查是否复制完整，确认账号状态正常

**Q: 搜索结果不准确？**
A: 优化查询词，增加上下文信息

**Q: 调用失败？**
A: 检查网络连接，确认 API 限额

**Q: 费用超支？**
A: 设置调用限制，启用缓存机制

---

_Perplexity AI Search API 配置指南 - Commander-X 多 Agent 协作系统_
