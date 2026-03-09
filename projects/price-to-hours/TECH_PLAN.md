# 技术实现计划

## 开发环境
- **OS:** Windows
- **浏览器:** Chrome
- **开发工具:** VS Code
- **测试方式:** Chrome Extension Developer Mode

---

## 详细实现步骤

### Step 1: 项目初始化
```bash
mkdir C:\Users\57684\price-to-hours
cd C:\Users\57684\price-to-hours
```

### Step 2: 创建 manifest.json
- 定义扩展基本信息
- 声明权限（storage）
- 配置 content scripts

### Step 3: 实现设置页
- `popup.html` - UI 布局
- `popup.js` - 逻辑处理
- 保存/读取 Chrome Storage

### Step 4: 实现价格识别
- `content.js` 注入页面
- 价格正则匹配
- 货币符号识别

### Step 5: 实现悬停弹窗
- 创建 Shadow DOM 元素
- 鼠标事件监听
- 工时计算和显示

### Step 6: 添加快捷键
- `background.js` 监听快捷键
- 切换 enabled 状态
- 更新 icon 状态

### Step 7: 样式和优化
- `content.css` 样式定义
- 响应式设计
- 动画效果

### Step 8: 图标准备
- 使用在线工具生成图标
- 准备 16x16, 48x48, 128x128

---

## 核心代码逻辑

### 价格识别正则
```javascript
const PRICE_PATTERNS = {
  CNY: /¥\s*(\d+(?:\.\d{1,2})?)/g,
  USD: /\$\s*(\d+(?:\.\d{1,2})?)/g,
  GBP: /£\s*(\d+(?:\.\d{1,2})?)/g,
  EUR: /€\s*(\d+(?:\.\d{1,2})?)/g,
  JPY: /¥\s*(\d+(?:\.\d{0,2})?)/g
};
```

### 工时计算函数
```javascript
function calculateWorkHours(price, hourlyRate) {
  const hours = price / hourlyRate;
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} 分钟`;
  } else if (hours < 24) {
    return `${hours.toFixed(1)} 小时`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days} 天 ${remainingHours} 小时`;
  }
}
```

### Chrome Storage 操作
```javascript
// 保存设置
chrome.storage.sync.set({
  hourlyRate: 50,
  currency: 'CNY',
  enabled: true
});

// 读取设置
chrome.storage.sync.get(['hourlyRate', 'currency'], (result) => {
  console.log(result);
});
```

---

## 测试计划

### 功能测试
1. **价格识别测试**
   - 测试 CNY: ¥299, ¥50.5
   - 测试 USD: $99, $12.99
   - 测试 GBP: £49.99
   - 测试 EUR: €199

2. **工时计算测试**
   - ¥299 / ¥50 = 5.98 小时
   - $99 / $20 = 4.95 小时
   - 边界值：¥1 / ¥1000

3. **交互测试**
   - 悬停显示弹窗
   - 离开关闭弹窗
   - 快捷键开关

### 兼容性测试
1. 淘宝
2. 京东
3. 亚马逊
4. 独立站
5. 其他电商网站

---

## 部署计划

### 本地测试
1. 打开 Chrome
2. 访问 `chrome://extensions`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录

### Chrome 商店发布
1. 创建开发者账号
2. 支付 $5 注册费
3. 填写商店信息
4. 上传 zip 包
5. 等待审核（1-3天）

---

## 时间估算

| 阶段 | 预计时间 | 备注 |
|------|---------|------|
| 项目初始化 | 30分钟 | 创建目录、文件 |
| manifest.json | 30分钟 | 配置扩展 |
| 设置页实现 | 2小时 | UI + 逻辑 |
| 价格识别 | 2小时 | 正则 + 测试 |
| 悬停弹窗 | 2小时 | Shadow DOM + 样式 |
| 快捷键 | 1小时 | background.js |
| 测试优化 | 2小时 | 多网站测试 |
| 打包发布 | 1小时 | README + zip |
| **总计** | **11小时** | **约1.5个工作日** |

---

## 技术风险和解决方案

### 风险：正则匹配不准确
**解决方案：**
- 收集更多价格格式样本
- 迭代优化正则表达式
- 添加"手动标记"功能

### 风险：Shadow DOM 兼容性
**解决方案：**
- 使用标准 Web Components API
- 添加降级方案（普通 DOM）
- 测试不同浏览器

### 风险：性能影响
**解决方案：**
- 使用防抖（debounce）
- 只在可见区域扫描
- 延迟加载脚本

---

_计划生成时间：2026-03-06 09:54_
_版本：v1.0_
