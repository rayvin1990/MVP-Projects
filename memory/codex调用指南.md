# Codex 调用指南

## 直接调用命令 (推荐)

使用 `exec` 工具时，设置足够长的超时 (最少 120 秒):

```
cd "C:\Users\57684\saasfly"
.\acpx.cmd --timeout 180 codex exec "<任务>"
```

示例 - 计算数学题:
```
cd "C:\Users\57684\saasfly"
.\acpx.cmd --timeout 180 codex exec "Calculate 123 + 456 = ?"
```

## 重要配置

1. **代理环境变量**: 在 .acpxrc.json 中通过 cmd /c 注入
2. **工作目录**: C:\Users\57684\saasfly
3. **超时设置**: 至少 180 秒，因为 Codex 初始化需要时间

## 注意事项

- Codex 首次调用需要加载上下文，约 30-60 秒
- 简单任务 (如计算) 约 60-120 秒
- 复杂任务可能需要更长时间
- 确保设置足够的 timeout 参数
