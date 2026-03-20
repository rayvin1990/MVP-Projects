# Chrome 扩展图标要求

**创建日期：** 2026-03-07  
**标签：** #chrome #extension #icons #design

---

## 必需尺寸

| 尺寸 | 用途 | 文件名建议 |
|------|------|-----------|
| **16x16** | 工具栏图标、扩展管理页 | icon16.png |
| **48x48** | 扩展管理页、Chrome 网上应用店 | icon48.png |
| **128x128** | 安装确认页、Chrome 网上应用店 | icon128.png |

---

## 设计要求

### ✅ 推荐

- 简洁清晰
- 高对比度
- 小尺寸也可识别
- PNG 格式（支持透明）

---

### ❌ 避免

- 文字太小（16px 时看不清）
- 复杂细节
- 低对比度
- JPG 格式（不支持透明）

---

## 快速生成方法

### 方法 1：使用 emoji（推荐）

1. 访问 https://favicon.io/emoji-favicons/
2. 选择 emoji（如 ⏱️）
3. 设置背景色（如黑色 #111）
4. 下载所有尺寸

---

### 方法 2：使用 Figma

1. 创建 128x128 画布
2. 设计图标
3. 导出 3 个尺寸

---

### 方法 3：使用在线工具

| 工具 | URL |
|------|-----|
| Favicon Generator | https://www.favicon-generator.org/ |
| App Icon Generator | https://appicon.co/ |

---

## manifest.json 配置

```json
{
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 文件位置

```
price-to-hours/
└── icons/
    ├── icon16.png    (0.4 KB)
    ├── icon48.png    (2.2 KB)
    └── icon128.png   (10.1 KB)
```

---

## 检查清单

- [ ] 3 个尺寸都准备好
- [ ] PNG 格式
- [ ] 16px 时清晰可识别
- [ ] manifest.json 配置正确
- [ ] 文件路径正确

---

_最后更新：2026-03-07_
