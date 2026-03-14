# 隐私政策模板（Chrome 扩展）

**创建日期：** 2026-03-07  
**标签：** #privacy #policy #template #chrome

---

## 核心原则

Chrome 商店要求隐私政策必须包含：

1. ✅ 收集什么数据
2. ✅ 如何使用数据
3. ✅ 是否分享给第三方
4. ✅ 用户权利

---

## 极简模板（适合不收集数据的扩展）

```markdown
# Privacy Policy - [扩展名称]

**Last Updated:** [日期]

## 1. Overview

[扩展名称] does not collect, store, or share any personal data.

## 2. Data Collection

We do NOT collect:
- No personal information
- No browsing history
- No search queries
- No location data

## 3. Data Storage

All settings are stored locally using Chrome Storage API.
Data never leaves your device.

## 4. Permissions

We request these permissions:
- `storage` - Save your settings locally
- `<all_urls>` - [解释为什么需要]

## 5. Third-Party Services

We do NOT use:
- No analytics
- No advertising
- No tracking

## 6. Contact

GitHub Issues: [链接]
```

---

## 完整版模板

见 `C:\Users\57684\price-to-hours\PRIVACY.md`

---

## HTML 版本

见 `C:\Users\57684\price-to-hours\privacy.html`

---

## 部署方式

### GitHub Pages（推荐）

```bash
# 1. 推送到 main 分支
git add privacy.html
git commit -m "Add privacy policy"
git push

# 2. 启用 GitHub Pages
# Settings → Pages → Branch: main → Save

# 3. 访问 URL
https://{username}.github.io/{repo}/privacy.html
```

---

## Chrome 商店要求

| 要求 | 状态 |
|------|------|
| 必须有隐私政策 | ✅ 必须 |
| URL 必须可访问 | ✅ 必须 |
| 内容必须真实 | ✅ 必须 |
| 必须是 HTTPS | ✅ 必须 |

---

## 常见错误

### ❌ 错误 1：URL 404

```
原因：GitHub Pages 没启用或构建中
解决：检查 Pages 设置，等待 2-5 分钟
```

---

### ❌ 错误 2：内容太简单

```
原因：只有一句话 "We don't collect data"
解决：使用模板，包含所有必需部分
```

---

### ❌ 错误 3：HTTP 而不是 HTTPS

```
原因：使用 HTTP 链接
解决：必须用 HTTPS（GitHub Pages 默认支持）
```

---

## 检查清单

提交前确认：

- [ ] URL 可访问（不是 404）
- [ ] 使用 HTTPS
- [ ] 包含数据收集说明
- [ ] 包含权限说明
- [ ] 包含联系方式
- [ ] 内容真实准确

---

## 相关文件

- [[github-pages-404-fix]] - GitHub Pages 问题排查
- [[chrome-store-submission]] - Chrome 商店提交

---

_最后更新：2026-03-07_
