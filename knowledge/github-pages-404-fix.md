# GitHub Pages 404 问题排查

**创建日期：** 2026-03-07  
**标签：** #github #pages #404 #troubleshooting

---

## 问题现象

```
访问：https://rayvin1990.github.io/saasfly/privacy.html
结果：404 Not Found
```

---

## 根本原因

GitHub Pages 不是推送后立即可用，需要：

1. ✅ 正确启用 Pages 设置
2. ✅ 等待构建完成（1-5 分钟）
3. ✅ 文件在正确的分支上

---

## 排查步骤

### Step 1: 确认文件已推送

```bash
# 检查文件是否在 main 分支
git ls-tree --name-only main | Select-String "privacy"

# 应该看到：
# PRIVACY.md
# privacy.html
```

---

### Step 2: 确认 Pages 设置

**访问：** https://github.com/{username}/{repo}/settings/pages

**检查：**

| 设置项 | 正确值 |
|--------|--------|
| Source | Deploy from a branch |
| Branch | `main`（或你选择的分支） |
| Folder | `/(root)` |
| Status | ✅ Your site is live at... |

---

### Step 3: 验证 URL

**测试根目录：**
```
https://rayvin1990.github.io/saasfly/
```

**测试具体文件：**
```
https://rayvin1990.github.io/saasfly/privacy.html
```

---

### Step 4: 等待构建

**GitHub Pages 构建时间：**
- 通常：1-5 分钟
- 最久：10 分钟

**检查构建状态：**
1. 访问 https://github.com/{username}/{repo}/deployments
2. 查看最新的 GitHub Pages 部署
3. 状态应该是 ✅ Success

---

## 常见错误

### 错误 1：选错分支

```
❌ 推送到 pages 分支，但 Pages 设置是 main
❌ 推送到 main 分支，但 Pages 设置是 master
```

**解决：** 统一分支名

---

### 错误 2：没点 Save

```
❌ 选了分支但没点 Save 按钮
```

**解决：** 重新进入设置页，点 Save

---

### 错误 3：文件路径错误

```
❌ 文件在 /docs 文件夹，但 Pages 设置是 /(root)
❌ 文件在 /(root)，但 Pages 设置是 /docs
```

**解决：** 统一路径

---

### 错误 4：仓库是私有的

```
❌ 私有仓库的 GitHub Pages 需要 Pro 账号
```

**解决：** 改为公开仓库 或 升级账号

---

## 快速验证脚本

```powershell
# 测试 GitHub Pages 是否可访问
$proxy = [System.Net.WebRequest]::DefaultWebProxy
[System.Net.WebRequest]::DefaultWebProxy = $null

try {
    $response = Invoke-WebRequest -Uri "https://rayvin1990.github.io/saasfly/privacy.html" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ 可访问 - 状态码：$($response.StatusCode)"
} catch {
    Write-Host "❌ 无法访问 - $($_.Exception.Message)"
    Write-Host "⏳ 可能还在构建中，等待 2 分钟再试"
}

[System.Net.WebRequest]::DefaultWebProxy = $proxy
```

---

## 正确流程（下次照做）

```
1. 创建隐私政策文件
   ↓
2. git add / commit / push 到 main 分支
   ↓
3. 访问 https://github.com/{user}/{repo}/settings/pages
   ↓
4. 确认 Branch = main, Folder = /(root)
   ↓
5. 点 Save（重要！）
   ↓
6. 等待 2-5 分钟
   ↓
7. 验证 URL 可访问
   ↓
8. 提交 Chrome 商店
```

---

## 相关文件

- [[chrome-store-submission]] - Chrome 商店提交流程
- [[privacy-policy-template]] - 隐私政策模板

---

_最后更新：2026-03-07_
