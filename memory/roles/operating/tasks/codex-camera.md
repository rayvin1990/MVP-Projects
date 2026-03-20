# Codex 任务：添加摄像头拍照功能

**项目：** 妆妹小程序  
**时间：** 2026-03-16  
**优先级：** P0

---

## 需求

在首页添加摄像头拍照功能，用户可以：
1. 点击拍照按钮调用微信相机
2. 拍摄化妆品/妆容照片
3. 分析图片内容（可选，目前先用语音描述引导）

## 技术方案

1. 在 `data` 中添加 `isCameraActive: false` 状态
2. 添加 `takePhoto` 方法调用 `wx.chooseMedia` 或 `wx.createCameraContext`
3. 拍照后可以：
   - 预览图片
   - 结合语音咨询功能

## 文件位置

- 主页面：`src/pages/index/index.js`
- 样式：`src/pages/index/index.wxss`

---

**执行要求：** 直接修改代码，不要只是写文档。
