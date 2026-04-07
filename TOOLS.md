# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## 环境变量

- `SECRET_PASSPHRASE`: 安全暗语（用于身份验证）

## Gemini CLI

- **API Key**: `REDACTED`
- **用途**: Gemini CLI (gemini) 调用
- **代理**: HTTP_PROXY/HTTPS_PROXY 已配置到 Gateway

## 配额追踪

### Web Search (Brave)
- **API Key**: `REDACTED`
- **月额度：** 1000 次
- **重置日期：** 每月 1 号
- **当前状态：** 15/1000 次（2026-03-06）
- **剩余次数：** 985 次

## 模型切换器

当模型不可用时，自动切换到下一个可用模型。

**脚本位置：** `D:\openclaw\workspace\scripts\model-switcher\model-switcher.js`

**使用方式：**
```bash
# 切换到下一个模型
node scripts/model-switcher/model-switcher.js --next

# 查看当前状态
node scripts/model-switcher/model-switcher.js --status
```

**触发条件：**
- 遇到模型调用失败时
- 收到"切换模型"指令时

**模型优先级：**
1. xfyun-coding/glm-5
2. xfyun-coding/astron-code-latest
3. minimax-cn/MiniMax-M2.5
4. deepseek/deepseek-chat
5. deepseek/deepseek-reasoner

