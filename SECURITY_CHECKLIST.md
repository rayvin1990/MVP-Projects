# 安全检查清单

## 提交前检查（必须）

- [ ] 确认没有真实 API Key（使用 `REDACTED` 或环境变量）
- [ ] 确认没有真实 App Secret / App Token
- [ ] 确认没有真实 Encrypt Key / Verify Token
- [ ] 确认没有真实飞书 App ID（cli_xxx）

## 已验证安全的占位符

| 类型 | 格式 | 示例 |
|------|------|------|
| API Key | REDACTED | `apiKey: 'REDACTED'` |
| App Secret | REDACTED | `appSecret: 'REDACTED'` |
| Token | REDACTED | `token: 'REDACTED'` |
| 占位符 | PLACEHOLDER | `YOUR_API_KEY_HERE` |

## 禁止的模式

```
# 禁止提交到 GitHub
sk-xxx              # OpenAI API Key
AKIAxxx            # AWS Access Key
AIzaSyxxx          # Google API Key
cli_xxx            # 飞书 App ID
appSecret=xxx      # 飞书 App Secret
appToken=xxx       # 飞书 App Token
```

## 安全原则

1. 所有敏感信息使用环境变量 (`process.env.XXX`)
2. 配置文件使用 `.env.example` 模板
3. 真实密钥存本地，不要提交
4. 每次提交前运行 `npm run security:check`
