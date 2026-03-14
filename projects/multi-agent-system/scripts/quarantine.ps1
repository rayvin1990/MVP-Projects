# Quarantine Script - 可疑文件隔离工具
# Author: Nia (AI Assistant)
# Created: 2026-03-11
# Purpose: 移动可疑文件到隔离目录，记录隔离日志

param(
    [string]$FilePath,
    [string]$Reason = "Suspicious file detected",
    [string]$Severity = "MEDIUM",
    [string]$QuarantineDir = "C:\Users\57684\.openclaw\workspace\projects\multi-agent-system\quarantine",
    [string]$LogDir = "C:\Users\57684\.openclaw\workspace\memory",
    [switch]$DryRun
)

$Date = Get-Date -Format "yyyy-MM-dd"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$LogFileName = "quarantine-log-$Date.md"
$LogFile = Join-Path $LogDir $LogFileName

# 确保目录存在
if (!(Test-Path $QuarantineDir)) {
    New-Item -ItemType Directory -Force -Path $QuarantineDir | Out-Null
    Write-Host "Created quarantine directory: $QuarantineDir" -ForegroundColor Green
}

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

# 生成隔离文件名（带时间戳避免冲突）
$OriginalFileName = Split-Path $FilePath -Leaf
$BaseName = [System.IO.Path]::GetFileNameWithoutExtension($OriginalFileName)
$Extension = [System.IO.Path]::GetExtension($OriginalFileName)
$QuarantineFileName = "${BaseName}_$(Get-Date -Format 'yyyyMMdd_HHmmss')${Extension}.quarantined"
$QuarantinePath = Join-Path $QuarantineDir $QuarantineFileName

# 隔离日志条目
function Write-Quarantine-Log {
    param(
        [string]$OriginalPath,
        [string]$QuarantinePath,
        [string]$Reason,
        [string]$Severity,
        [string]$Action
    )
    
    $LogEntry = "| $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $Severity | $(Split-Path $OriginalPath -Leaf) | $Action | $Reason |"
    
    # 如果日志文件不存在，创建表头
    if (!(Test-Path $LogFile)) {
        $Header = "# Quarantine Log - 隔离日志`n`n"
        $Header += "Date: $Date`n`n"
        $Header += "## Quarantine Actions`n`n"
        $Header += "| Timestamp | Severity | File | Action | Reason |`n"
        $Header += "|-----------|----------|------|--------|--------|"
        $Header | Out-File -FilePath $LogFile -Encoding UTF8
    }
    
    # 追加日志条目
    $LogEntry | Out-File -FilePath $LogFile -Encoding UTF8 -Append
}

# 主隔离函数
function Invoke-Quarantine {
    Write-Host ""
    Write-Host "=== File Quarantine ===" -ForegroundColor Cyan
    Write-Host "Original:  $FilePath"
    Write-Host "Quarantine: $QuarantinePath"
    Write-Host "Reason:    $Reason"
    Write-Host "Severity:  $Severity"
    Write-Host ""
    
    if (!(Test-Path $FilePath)) {
        Write-Host "ERROR: File not found: $FilePath" -ForegroundColor Red
        return $false
    }
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would quarantine file but skipping..." -ForegroundColor Yellow
        return $true
    }
    
    try {
        # 复制文件到隔离目录（保留原文件用于调查）
        Copy-Item -Path $FilePath -Destination $QuarantinePath -Force
        Write-Host "✓ File copied to quarantine" -ForegroundColor Green
        
        # 删除原文件
        Remove-Item -Path $FilePath -Force
        Write-Host "✓ Original file removed" -ForegroundColor Green
        
        # 记录日志
        Write-Quarantine-Log -OriginalPath $FilePath -QuarantinePath $QuarantinePath -Reason $Reason -Severity $Severity -Action "QUARANTINED"
        Write-Host "✓ Log entry added" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Quarantine Complete!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: Quarantine failed: $_" -ForegroundColor Red
        return $false
    }
}

# 批量隔离函数
function Invoke-Bulk-Quarantine {
    param(
        [string[]]$FilePaths,
        [string]$Reason = "Bulk quarantine operation",
        [string]$Severity = "MEDIUM"
    )
    
    Write-Host ""
    Write-Host "=== Bulk Quarantine Operation ===" -ForegroundColor Cyan
    Write-Host "Files to quarantine: $($FilePaths.Count)"
    Write-Host ""
    
    $SuccessCount = 0
    $FailCount = 0
    
    foreach ($file in $FilePaths) {
        if (Invoke-Quarantine -FilePath $file -Reason $Reason -Severity $Severity) {
            $SuccessCount++
        } else {
            $FailCount++
        }
    }
    
    Write-Host ""
    Write-Host "=== Summary ===" -ForegroundColor Cyan
    Write-Host "Successful: $SuccessCount" -ForegroundColor Green
    Write-Host "Failed:     $FailCount" -ForegroundColor $(if ($FailCount -gt 0) { "Red" } else { "Green" })
    
    return @{ Success = $SuccessCount; Failed = $FailCount }
}

# 列出隔离目录内容
function Get-Quarantine-List {
    param([string]$QuarantineDir = "C:\Users\57684\.openclaw\workspace\projects\multi-agent-system\quarantine")
    
    Write-Host ""
    Write-Host "=== Quarantine Directory Contents ===" -ForegroundColor Cyan
    Write-Host "Directory: $QuarantineDir"
    Write-Host ""
    
    if (!(Test-Path $QuarantineDir)) {
        Write-Host "Quarantine directory does not exist." -ForegroundColor Yellow
        return @()
    }
    
    $files = Get-ChildItem -Path $QuarantineDir -File | Select-Object Name, Length, LastWriteTime
    if ($files.Count -eq 0) {
        Write-Host "No quarantined files." -ForegroundColor Gray
    } else {
        $files | Format-Table -AutoSize
    }
    
    return $files
}

# 恢复隔离文件
function Restore-From-Quarantine {
    param(
        [string]$QuarantinePath,
        [string]$RestorePath
    )
    
    Write-Host ""
    Write-Host "=== Restore from Quarantine ===" -ForegroundColor Cyan
    Write-Host "From: $QuarantinePath"
    Write-Host "To:   $RestorePath"
    Write-Host ""
    
    if (!(Test-Path $QuarantinePath)) {
        Write-Host "ERROR: Quarantined file not found: $QuarantinePath" -ForegroundColor Red
        return $false
    }
    
    try {
        # 确保目标目录存在
        $RestoreDir = Split-Path $RestorePath -Parent
        if (!(Test-Path $RestoreDir)) {
            New-Item -ItemType Directory -Force -Path $RestoreDir | Out-Null
        }
        
        # 恢复文件（去掉 .quarantined 后缀）
        $OriginalName = (Split-Path $QuarantinePath -Leaf) -replace '\.quarantined$', ''
        $ActualRestorePath = Join-Path $RestoreDir $OriginalName
        
        Copy-Item -Path $QuarantinePath -Destination $ActualRestorePath -Force
        Write-Host "✓ File restored to: $ActualRestorePath" -ForegroundColor Green
        
        # 记录恢复日志
        Write-Quarantine-Log -OriginalPath $QuarantinePath -QuarantinePath $ActualRestorePath -Reason "Manual restore" -Severity "INFO" -Action "RESTORED"
        
        return $true
    }
    catch {
        Write-Host "ERROR: Restore failed: $_" -ForegroundColor Red
        return $false
    }
}

# 如果直接运行脚本（非模块导入）
if ($MyInvocation.ScriptName -and $MyInvocation.ScriptName -like "*.ps1") {
    if ($FilePath) {
        Invoke-Quarantine -FilePath $FilePath -Reason $Reason -Severity $Severity -DryRun:$DryRun
    } else {
        Write-Host "Usage: .\quarantine.ps1 -FilePath <path> [-Reason <reason>] [-Severity <HIGH|MEDIUM|LOW>]" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\quarantine.ps1 -FilePath 'C:\suspicious.exe' -Reason 'Malware detected' -Severity 'HIGH'"
        Write-Host "  .\quarantine.ps1 -FilePath 'C:\test.bat' -DryRun"
        Write-Host ""
        Write-Host "Other commands:" -ForegroundColor Yellow
        Write-Host "  .\quarantine.ps1 -List  (not implemented, use Get-Quarantine-List function)"
    }
}

# 导出函数供其他脚本使用
Export-ModuleMember -Function Invoke-Quarantine, Invoke-Bulk-Quarantine, Get-Quarantine-List, Restore-From-Quarantine, Write-Quarantine-Log 2>$null
