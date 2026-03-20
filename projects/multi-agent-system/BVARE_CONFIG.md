# Bvare AI Search API 配置指南

**版本:** v1.0  
**日期:** 2026-03-10  
**用途:** 配置 Bvare AI Search API 实现全球数据搜索

---

## 🎯 为什么用 Bvare AI Search

### 优势

| 优势 | 说明 |
|------|------|
| **全球数据** | 访问 Reddit、Twitter、Product Hunt 等全球平台 |
| **无需代理** | API 方式访问，绕过网络限制 |
| **AI 搜索** | 智能搜索结果，精准匹配 |
| **实时数据** | 获取最新的内容和趋势 |
| **开发者友好** | 简单易用的 API 接口 |

### 适用场景

- ✅ Reddit 痛点挖掘
- ✅ 全球趋势分析
- ✅ 竞品调研
- ✅ SEO 关键词研究
- ✅ 技术文档查询

---

## 🔧 配置步骤

### 1. 获取 API Key

1. 访问 Bvare 官网
2. 注册/登录账号
3. 进入 Dashboard → API Keys
4. 创建新的 API Key
5. 复制保存

### 2. 配置环境变量

**Windows PowerShell:**
```powershell
# 临时设置（当前会话）
$env:BVARE_API_KEY="你的-bvare-api-key"

# 永久设置
setx BVARE_API_KEY "你的-bvare-api-key"
```

**Linux/Mac:**
```bash
# 临时设置
export BVARE_API_KEY="你的-bvare-api-key"

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export BVARE_API_KEY="你的-bvare-api-key"' >> ~/.bashrc
source ~/.bashrc
```

### 3. 验证配置

```bash
# 检查环境变量是否设置成功
echo $env:BVARE_API_KEY  # Windows
echo $BVARE_API_KEY      # Linux/Mac
```

---

## 📋 在 Commander-X 中使用

### 自动检测机制

系统会自动检测 Bvare API Key：

```python
# 伪代码示例
def check_data_source():
    if has_env("BVARE_API_KEY"):
        return "bvare_api"  # 优先使用 Bvare
    elif can_access("zhihu.com"):
        return "domestic"   # 降级到国内平台
    else:
        return "offline"    # 离线模式
```

### Researcher Agent 调用流程

```
步骤 1: 痛点挖掘
├─ 检测 BVARE_API_KEY
│  ├─ 有 → 使用 Bvare AI Search 搜索 Reddit
│  └─ 无 → 使用知乎/小红书替代
│
└─ 输出：痛点分析报告

步骤 2: SEO 关键词
├─ 检测 BVARE_API_KEY
│  ├─ 有 → 使用 Bvare 搜索全球趋势
│  └─ 无 → 使用百度指数/微信指数
│
└─ 输出：关键词列表
```

---

## 🔄 数据源优先级（配置 Bvare 后）

```
步骤 1: 痛点挖掘
├─ 有 Bvare API ✅ → Reddit + Twitter + Product Hunt
│  └─ 优势：全球数据、实时、AI 搜索
├─ 无 API 但能上网 → 知乎 + 小红书
│  └─ 优势：国内用户、中文内容
└─ 完全离线 → 用户提供数据
   └─ 优势：精准、可控

步骤 2: SEO 关键词
├─ 有 Bvare API ✅ → 全球搜索趋势
│  └─ 优势：全球数据、准确
├─ 无 API 但能上网 → 百度指数 + 微信指数
│  └─ 优势：国内数据、免费
└─ 完全离线 → 常见关键词推荐
   └─ 优势：快速、基础可用

步骤 9: 部署上线
├─ 能访问 GitHub → GitHub + Vercel
└─ 不能访问 → Gitee + 本地运行
```

---

## 📊 配置前后对比

| 指标 | 配置前（国内数据） | 配置后（Bvare API） | 提升 |
|------|-------------------|-------------------|------|
| 数据覆盖 | 国内用户 | 全球用户 | 🌍 10x |
| 搜索时间 | 15 分钟 | 2 分钟 | ⚡ 87% |
| 数据质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 📈 +1 |
| 实时性 | 延迟 | 实时 | 🔄 即时 |
| Reddit 访问 | ❌ 不可用 | ✅ 可用 | 🎯 100% |
| Google 趋势 | ❌ 不可用 | ✅ 可用 | 🎯 100% |

---

## 🛡️ 安全建议

### API Key 保护

```bash
# ✅ 正确：使用环境变量
export BVARE_API_KEY="xxx"

# ❌ 错误：硬编码在代码中
api_key = "xxx"  # 不要这样做！
```

### 权限控制

- 只授予 Researcher Agent 使用权限
- 设置调用频率限制
- 记录所有 API 调用日志
- 定期轮换 API Key

---

## 📝 配置检查清单

配置完成后检查：

- [ ] Bvare API Key 已获取
- [ ] 环境变量已设置（`BVARE_API_KEY`）
- [ ] 重启终端验证
- [ ] Researcher Agent 可以调用
- [ ] 搜索返回真实数据
- [ ] 调用日志正常

---

## 💡 使用建议

1. **明确查询** - 问题越具体，结果越精准
2. **迭代搜索** - 根据结果调整查询词
3. **验证数据** - 重要数据交叉验证
4. **保存结果** - 缓存有价值的搜索结果
5. **合理配额** - 根据套餐限制使用

---

## 🎯 完整工作流（配置 Bvare 后）

```
用户目标："做一个帮助用户快速整理浏览器书签的工具"
    ↓
步骤 1: Reddit 挖痛点 (Bvare API)
    ↓
真实 Reddit 数据：
- "How do you manage hundreds of bookmarks?" (2.3K 赞同)
- "Best tool for organizing bookmarks?" (1.8K 赞同)
    ↓
步骤 2: SEO 关键词 (Bvare API)
    ↓
真实 Google 趋势数据：
- "bookmark management": 1,258 搜索/月
- "bookmark organizer": 892 搜索/月
    ↓
步骤 3-9: 基于真实全球数据执行
    ↓
最终产品：面向全球用户的书签管理工具
```

---

## 📞 常见问题

**Q: API Key 无效？**
A: 检查是否复制完整，确认账号状态正常

**Q: 搜索结果为空？**
A: 优化查询词，尝试英文关键词

**Q: 调用失败？**
A: 检查网络连接，确认 API 限额

**Q: 费用超支？**
A: 设置调用限制，启用缓存机制

---

_Bvare AI Search API 配置指南 - Commander-X 多 Agent 协作系统_
