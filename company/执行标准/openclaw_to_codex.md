# OpenClaw → Codex（奥特门）协作协议

**版本：** v1.0  
**生效日期：** 2026-03-13  
**状态：** 激活

---

## 🎯 调用方式

**Codex（奥特门）通过文件队列接收任务**

### 目录结构

```
agent-workspace/
├── tasks/           # OpenClaw 写入任务
└── results/         # Codex 写入结果
```

### 任务文件格式

**文件：** `tasks/task-YYYYMMDD-HHMMSS.json`

```json
{
  "agent": "openclaw",
  "target": "aotemen",
  "task": "任务描述",
  "workspace": "C:\\Users\\57684\\workspace",
  "priority": "high|medium|low",
  "input_files": ["文件路径 1", "文件路径 2"],
  "output_format": "期望输出格式",
  "deadline": "期望完成时间"
}
```

### 结果文件格式

**文件：** `results/result-YYYYMMDD-HHMMSS.json`

```json
{
  "task_id": "task-YYYYMMDD-HHMMSS",
  "status": "completed|failed",
  "result": "执行结果",
  "output_files": ["输出文件路径"],
  "notes": "备注",
  "completed_at": "完成时间"
}
```

---

## 🔄 工作流程

```
1. OpenClaw 创建任务文件 → tasks/task-20260313-103000.json
2. Codex 轮询 tasks/ 目录
3. Codex 读取并执行任务
4. Codex 写入结果 → results/result-20260313-103000.json
5. OpenClaw 读取结果
```

---

## 📋 任务示例

### 示例 1：语义搜索测试

**tasks/task-20260313-103000.json:**
```json
{
  "agent": "openclaw",
  "target": "aotemen",
  "task": "执行语义搜索手动测试",
  "workspace": "C:\\Users\\57684\\.openclaw\\workspace\\projects\\ContextCapsule",
  "priority": "high",
  "input_files": [
    "TEST_SEMANTIC_SEARCH.md"
  ],
  "output_format": "markdown",
  "deadline": "2026-03-13 18:00"
}
```

### 示例 2：安全扫描整合

**tasks/task-20260313-140000.json:**
```json
{
  "agent": "openclaw",
  "target": "aotemen",
  "task": "整合安全扫描脚本到 Codex 工作流",
  "workspace": "C:\\Users\\57684\\.openclaw\\workspace",
  "priority": "medium",
  "input_files": [
    "scripts/security-scan.ps1"
  ],
  "output_format": "markdown + 脚本",
  "deadline": "2026-03-13 18:00"
}
```

---

## ⚡ PowerShell 调度脚本

**文件：** `scripts/codex-dispatcher.ps1`

```powershell
# Codex 任务调度器
# 轮询 tasks/ 目录，执行任务，写入结果

$tasksDir = "C:\Users\57684\.openclaw\workspace\agent-workspace\tasks"
$resultsDir = "C:\Users\57684\.openclaw\workspace\agent-workspace\results"
$pollInterval = 30 # 秒

while ($true) {
    $taskFiles = Get-ChildItem -Path $tasksDir -Filter "*.json" -ErrorAction SilentlyContinue
    
    foreach ($taskFile in $taskFiles) {
        $task = Get-Content $taskFile.FullName -Raw | ConvertFrom-Json
        
        if ($task.target -eq "aotemen") {
            Write-Host "执行任务：$($task.task)"
            
            # 执行任务逻辑
            $result = Invoke-Task -task $task
            
            # 写入结果
            $resultFile = Join-Path $resultsDir "result-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
            $result | ConvertTo-Json | Set-Content $resultFile
            
            # 删除已处理的任务
            Remove-Item $taskFile.FullName
        }
    }
    
    Start-Sleep -Seconds $pollInterval
}
```

---

## 🗂️ 共享记忆区

**任务上下文仍使用：**
```
C:\Users\57684\.openclaw\workspace\memory\memory-system-v2
```

---

## ✅ 验收标准

- [ ] tasks/ 目录创建成功
- [ ] results/ 目录创建成功
- [ ] 任务格式验证通过
- [ ] 结果格式验证通过
- [ ] 调度脚本可运行

---

**版本：** v1.0  
**创建时间：** 2026-03-13  
**首次使用：** 2026-03-13 10:30（语义搜索测试）
