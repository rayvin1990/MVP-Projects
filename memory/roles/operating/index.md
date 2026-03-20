# Operating Role Library

## 角色库索引

### 默认角色（Default Roles）

| Role ID | Role Name | Belongs To | Status |
|---------|-----------|------------|--------|
| `nia-ceo` | Chief Orchestrator | nia | default |
| `pm-execution` | Execution Driver | PM | default |
| `product-mvp` | MVP 2.0 Product Owner | Product Manager | default |
| `growth-seo` | Search Growth Strategist | SEO / Growth | default |
| `doc-archivist` | Structured Archivist | Documentation Manager | default |
| `research-evidence` | Evidence-First Researcher | Market Research | default |
| `security-risk` | Risk Gatekeeper | Security Manager | default |
| `final-approver` | Release Approver | Final Review Agent | default |
| `codex-lead` | Engineering Coordinator | Codex Team Lead | default |
| `codex-arch` | System Architect | Architecture Agent | default |
| `codex-dev` | Fullstack Builder | Dev Agent | default |
| `codex-complex` | Deep Debugger | Complex Problem Agent | default |
| `claude-lead` | Quality Operations Coordinator | Claude Code Team Lead | default |
| `claude-test` | Strict QA Engineer | Test Agent | default |
| `claude-deploy` | Release Manager | Deploy Agent | default |
| `claude-ops` | Reliability Guardian | Ops Agent | default |

### 临时角色（Optional Roles）

| Role ID | Role Name | Belongs To | Status |
|---------|-----------|------------|--------|
| `nia-strategy` | Strategy Reviewer | nia | optional |
| `nia-portfolio` | Portfolio Prioritizer | nia | optional |
| `nia-crisis` | Crisis Commander | nia | optional |
| `pm-sprint` | MVP Sprint Manager | PM | optional |
| `pm-cross` | Cross-Team Coordinator | PM | optional |
| `pm-delivery` | Delivery Integrator | PM | optional |
| `product-critic` | User Value Critic | Product Manager | optional |
| `product-diff` | Differentiation Strategist | Product Manager | optional |
| `product-onboard` | Onboarding Simplifier | Product Manager | optional |
| `growth-content` | Content Cluster Architect | SEO / Growth | optional |
| `growth-conversion` | Conversion SEO Editor | SEO / Growth | optional |
| `growth-programmatic` | Programmatic SEO Builder | SEO / Growth | optional |
| `codex-prototype` | Rapid Prototyper | Dev Agent | optional |
| `codex-performance` | Performance Engineer | Complex Problem Agent | optional |
| `final-auditor` | Production Readiness Auditor | Final Review Agent | optional |

### 归档角色（Archived）

暂无

---

## 角色调用协议

### Operating Role Activation

```
ROLE_ACTIVATION

Agent:
Role ID:
Reason:
Task:
Expected Output:
Duration:
Fallback Role:
```

### 权限

- **nia** 拥有完整角色权限
- **PM** 拥有项目级角色权限
- **Team Lead** 可推荐但不可最终决定跨 scope 角色变更
