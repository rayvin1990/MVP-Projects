# Codex 任务调度器
# 轮询 tasks/ 目录，通知 Codex 执行任务

$tasksDir = "C:\Users\57684\.openclaw\workspace\agent-workspace\tasks"
$resultsDir = "C:\Users\57684\.openclaw\workspace\agent-workspace\results"
$pollInterval = 30 # 秒

Write-Host "=== Codex 任务调度器启动 ===" -ForegroundColor Cyan
Write-Host "监控目录：$tasksDir"
Write-Host "结果目录：$resultsDir"
Write-Host "轮询间隔：${pollInterval}秒"
Write-Host ""

while ($true) {
    $taskFiles = Get-ChildItem -Path $tasksDir -Filter "*.json" -ErrorAction SilentlyContinue
    
    if ($taskFiles.Count -gt 0) {
        foreach ($taskFile in $taskFiles) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 发现新任务：$($taskFile.Name)" -ForegroundColor Yellow
            
            try {
                $task = Get-Content $taskFile.FullName -Raw | ConvertFrom-Json
                
                if ($task.target -eq "aotemen") {
                    Write-Host "  任务：$($task.task)" -ForegroundColor Green
                    Write-Host "  优先级：$($task.priority)" -ForegroundColor Green
                    Write-Host "  截止：$($task.deadline)" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "  ðŸ'¡ 请 Codex 执行此任务，完成后在 results/ 写入结果文件" -ForegroundColor Cyan
                    Write-Host ""
                    
                    # 标记为处理中（可选）
                    # Move-Item $taskFile.FullName -Destination $resultsDir -Force
                }
            } catch {
                Write-Host "  错误：$($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 无新任务，等待中..." -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds $pollInterval
}
