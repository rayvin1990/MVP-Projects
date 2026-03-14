# Chrome 商店提交流程

**创建日期：** 2026-03-07  
**标签：** #chrome #extension #store #submission

---

## 提交前检查清单

### ✅ 代码准备

- [ ] `manifest.json` 配置正确
- [ ] 图标文件（3 个尺寸）
  - [ ] icon16.png
  - [ ] icon48.png
  - [ ] icon128.png
- [ ] 所有代码文件在正确位置

---

### ✅ 截图准备

| 要求 | 状态 |
|------|------|
| 最少 1 张 | ✅ |
| 推荐尺寸 | 1280x800 或 1920x1080 |
| 格式 | PNG 或 JPG |
| 最大大小 | 10 MB 每张 |

**文件位置：** `price-to-hours/image/`

---

### ✅ 文案准备

| 项目 | 字符限制 | 内容 |
|------|---------|------|
| **名称** | - | Price to Hours |
| **简短描述** | 132 字符 | See prices as hours of work. Shop smarter, spend wiser. |
| **详细描述** | 不限 | 见 `STORE-DESCRIPTION.md` |
| **分类** | - | Shopping |

---

### ✅ 隐私政策

- [ ] 隐私政策页面已部署
- [ ] URL 可访问（不是 404）
- [ ] 内容符合 Chrome 要求

**URL 示例：**
```
https://rayvin1990.github.io/saasfly/privacy.html
```

---

### ✅ 其他要求

- [ ] Google 开发者账号（一次性 $5 费用）
- [ ] 已支付开发者注册费
- [ ] 登录 Chrome Web Store Developer Dashboard

---

## 提交流程

### Step 1: 登录开发者后台

**访问：** https://chrome.google.com/webstore/devconsole

---

### Step 2: 创建新应用

1. 点击 **New Item**
2. 上传 `.zip` 文件（包含所有扩展文件）
3. 填写应用名称

---

### Step 3: 填写商店信息

#### 基本信息
- **名称：** Price to Hours
- **简短描述：** See prices as hours of work. Shop smarter, spend wiser.
- **分类：** Shopping

#### 详细描述
复制 `STORE-DESCRIPTION.md` 的内容

---

#### 截图上传
1. 上传 5 张截图
2. 排序（第一张最重要）
3. 可选：添加宣传视频

---

#### 隐私政策
- **Privacy Policy URL:** `https://rayvin1990.github.io/saasfly/privacy.html`

---

### Step 4: 设置可见性

| 选项 | 说明 |
|------|------|
| **Public** | 公开发布，所有人可见 |
| **Unlisted** | 不公开，只有链接可访问 |
| **Private** | 仅自己可见 |

**建议：** 首次提交选 **Unlisted**，测试通过后再改 Public

---

### Step 5: 提交审核

1. 点击 **Publish**
2. 等待审核（通常 1-3 个工作日）
3. 审核通过后可见

---

## 常见拒绝原因

### 拒绝原因 1：隐私政策无效

```
❌ URL 404
❌ 内容不符合要求
❌ 没有隐私政策
```

**解决：** 确保 URL 可访问，内容完整

---

### 拒绝原因 2：权限说明不清

```
❌ 使用了 <all_urls> 但没有解释为什么
```

**解决：** 在详细描述中说明需要访问所有 URL 来读取价格

---

### 拒绝原因 3：功能与描述不符

```
❌ 描述说能做什么，但实际扩展做不到
```

**解决：** 确保描述真实准确

---

### 拒绝原因 4：截图不清晰

```
❌ 截图太小（<1280px 宽度）
❌ 截图模糊
```

**解决：** 重新截图，确保 1280x800 或更大

---

## 打包扩展

### 方法 A：手动打包

```bash
cd C:\Users\57684\price-to-hours

# 排除不需要的文件
# 创建 zip 文件包含：
# - manifest.json
# - content/
# - core/
# - popup/
# - styles/
# - icons/
```

---

### 方法 B：使用 Chrome 打包

1. 打开 `chrome://extensions`
2. 启用开发者模式
3. 点击 **Pack extension**
4. 选择扩展目录
5. 生成 `.crx` 和 `.pem` 文件

---

## 审核时间线

| 阶段 | 时间 |
|------|------|
| 提交后 | 立即显示 "Under review" |
| 初审 | 1-2 个工作日 |
| 完整审核 | 3-5 个工作日 |
| 发布 | 审核通过后立即 |

---

## 更新扩展

### 流程

1. 修改代码
2. 更新 `manifest.json` 中的 `version`
3. 重新打包
4. 上传新版本
5. 等待审核（通常更快）

---

### 版本号规范

```
主版本。次版本。修订版本
例如：1.9.3 → 1.9.4
```

---

## 相关文件

- [[github-pages-404-fix]] - GitHub Pages 问题排查
- [[privacy-policy-template]] - 隐私政策模板
- [[store-description-template]] - 商店文案模板

---

_最后更新：2026-03-07_
