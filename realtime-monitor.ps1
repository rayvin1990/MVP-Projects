# ============================================================================
# Real-Time Security Monitor - 实时安全监控脚本
# Version: 1.0.0
# Author: SEC (Security Manager)
# ============================================================================

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$Test
)

$WorkspacePath = "C:\Users\57684\.openclaw\workspace"
$LogPath = Join-Path $WorkspacePath "security-logs"
$QuarantinePath = Join-Path $WorkspacePath "quarantine"
$WhitelistPath = Join-Path $WorkspacePath "whitelist.json"
$BlacklistPath = Join-Path $WorkspacePath "blacklist.json"
$StatePath = Join-Path $LogPath "monitor-state.json"
$AlertScript = Join-Path $WorkspacePath "auto-respond.ps1"

$WatchDirectories = @(
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents"
)

# 系统禁区 - 只读扫描，不执行任何动作
$RestrictedZones = @(
    "C:\Windows\",
    "C:\Windows"
)

function Test-IsRestrictedZone {
    param([string]$FilePath)
    if (!$FilePath) { return $false }
    foreach ($zone in $RestrictedZones) {
        if ($FilePath.StartsWith($zone, [System.StringComparison]::InvariantCultureIgnoreCase)) {
            return $true
        }
    }
    return $false
}

foreach ($dir in @($LogPath, $QuarantinePath)) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

function Write-SecurityLog {
    param([string]$Level, [string]$Message, [string]$Category = "General")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [$Category] $Message"
    
    if ($Level -eq "INFO") { $color = "Cyan" }
    elseif ($Level -eq "WARN") { $color = "Yellow" }
    elseif ($Level -eq "ALERT") { $color = "Red" }
    elseif ($Level -eq "CRITICAL") { $color = "DarkRed" }
    else { $color = "White" }
    
    Write-Host $logEntry -ForegroundColor $color
    $logFile = Join-Path $LogPath "$(Get-Date -Format 'yyyy-MM-dd').log"
    Add-Content -Path $logFile -Value $logEntry
}

function Get-Whitelist {
    if (Test-Path $WhitelistPath) {
        return Get-Content $WhitelistPath | ConvertFrom-Json
    }
    return $null
}

function Get-Blacklist {
    if (Test-Path $BlacklistPath) {
        return Get-Content $BlacklistPath | ConvertFrom-Json
    }
    return $null
}

function Test-IsWhitelisted {
    param([string]$ProcessName)
    $whitelist = Get-Whitelist
    if (!$whitelist) { return $false }
    $allProcesses = @()
    foreach ($category in $whitelist.processes.PSObject.Properties) {
        $allProcesses += $category.Value
    }
    return $allProcesses -contains $ProcessName
}

function Test-IsBlacklisted {
    param([string]$ProcessName)
    $blacklist = Get-Blacklist
    if (!$blacklist) { return $false }
    return $blacklist.processNames -contains $ProcessName
}

$PreviousProcesses = @{}

function Monitor-Processes {
    Write-SecurityLog "INFO" "开始进程监控..." "Process"
    $currentProcesses = @{}
    $allProcesses = Get-Process -ErrorAction SilentlyContinue
    
    foreach ($proc in $allProcesses) {
        $procInfo = New-Object PSObject -Property @{
            Name = $proc.Name
            Path = $proc.Path
            StartTime = $proc.StartTime
        }
        $currentProcesses[$proc.Id] = $procInfo
        
        if (!$PreviousProcesses.ContainsKey($proc.Id)) {
            $procAge = (New-TimeSpan -Start $proc.StartTime -End (Get-Date)).TotalSeconds
            if ($procAge -lt 5) {
                Write-SecurityLog "INFO" "检测到新进程：$($proc.Name) (PID: $($proc.Id))" "Process"
                
                # 检查是否为系统禁区路径
                if (Test-IsRestrictedZone -FilePath $proc.Path) {
                    Write-SecurityLog "ALERT" "[禁区] 系统核心目录进程：$($proc.Name) (PID: $($proc.Id)) - 仅记录，不响应" "RestrictedZone"
                }
                elseif (Test-IsBlacklisted -ProcessName $proc.Name) {
                    Write-SecurityLog "CRITICAL" "黑名单进程检测：$($proc.Name)" "Threat"
                    Invoke-AutoRespond -Type "Process" -Threat "BlacklistedProcess" -Details $proc
                }
                
                if (!(Test-IsWhitelisted -ProcessName $proc.Name)) {
                    Write-SecurityLog "WARN" "未知进程：$($proc.Name) (PID: $($proc.Id))" "Process"
                    Add-PendingConfirmation -ProcessName $proc.Name -ProcessId $proc.Id
                }
            }
        }
    }
    $script:PreviousProcesses = $currentProcesses
}

function Add-PendingConfirmation {
    param([string]$ProcessName, [int]$ProcessId)
    $state = @{}
    if (Test-Path $StatePath) {
        $state = Get-Content $StatePath | ConvertFrom-Json | ConvertTo-HashTable
    }
    if (!$state.ContainsKey("pendingProcesses")) {
        $state["pendingProcesses"] = @()
    }
    $pending = $state["pendingProcesses"]
    $existing = $pending | Where-Object { $_.Name -eq $ProcessName -and $_.Id -eq $ProcessId }
    if (!$existing) {
        $pending += New-Object PSObject -Property @{
            Name = $ProcessName
            Id = $ProcessId
            DetectedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        $state["pendingProcesses"] = $pending
        $state | ConvertTo-Json | Set-Content -Path $StatePath
    }
}

function ConvertTo-HashTable {
    param($obj)
    $hash = @{}
    $obj.PSObject.Properties | ForEach-Object { $hash[$_.Name] = $_.Value }
    return $hash
}

function Invoke-AutoRespond {
    param([string]$Type, [string]$Threat, [object]$Details)
    if (Test-Path $AlertScript) {
        $detailsJson = $Details | ConvertTo-Json -Compress
        & $AlertScript -Type $Type -Threat $Threat -Details $detailsJson
    } else {
        Write-SecurityLog "ALERT" "自动响应脚本不存在" "Response"
    }
}

function Install-MonitorService {
    Write-Host "`n[INSTALL] 正在安装监控服务..." -ForegroundColor Green
    $taskName = "SecurityRealtimeMonitor"
    $scriptPath = $MyInvocation.MyCommand.Path
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RunContinuous
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
    Write-Host "[INSTALL] 服务已安装：$taskName" -ForegroundColor Green
}

function Uninstall-MonitorService {
    Write-Host "`n[UNINSTALL] 正在卸载监控服务..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "SecurityRealtimeMonitor" -Confirm:$false
    Write-Host "[UNINSTALL] 服务已卸载" -ForegroundColor Yellow
}

function Show-Status {
    Write-Host "`n[STATUS] 监控服务状态" -ForegroundColor Cyan
    $task = Get-ScheduledTask -TaskName "SecurityRealtimeMonitor" -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "服务：SecurityRealtimeMonitor, 状态：$($task.State)" -ForegroundColor Green
    } else {
        Write-Host "服务未安装" -ForegroundColor Red
    }
}

function Run-Test {
    Write-Host "`n[TEST] 运行测试模式..." -ForegroundColor Magenta
    Write-SecurityLog "INFO" "测试日志功能" "Test"
    Write-SecurityLog "WARN" "测试警告功能" "Test"
    Write-SecurityLog "ALERT" "测试警报功能" "Test"
    
    Write-Host "`n[TEST] 白名单测试:" -ForegroundColor Cyan
    Write-Host "  chrome.exe: $(Test-IsWhitelisted 'chrome.exe')"
    Write-Host "  notepad.exe: $(Test-IsWhitelisted 'notepad.exe')"
    
    Write-Host "`n[TEST] 黑名单测试:" -ForegroundColor Cyan
    Write-Host "  mimikatz.exe: $(Test-IsBlacklisted 'mimikatz.exe')"
    
    Write-Host "`n[TEST] 测试完成" -ForegroundColor Magenta
}

function Start-Monitoring {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "     Real-Time Security Monitor v1.0.0" -ForegroundColor Cyan
    Write-Host "========================================================`n" -ForegroundColor Cyan
    Write-SecurityLog "INFO" "安全监控服务启动" "System"
    Write-Host "[MONITOR] 监控已启动，按 Ctrl+C 停止..." -ForegroundColor Green
    
    try {
        while ($true) {
            Monitor-Processes
            Start-Sleep -Seconds 5
        }
    }
    catch {
        Write-SecurityLog "INFO" "安全监控服务停止" "System"
        Write-Host "`n[MONITOR] 监控已停止" -ForegroundColor Yellow
    }
}

if ($Install) { Install-MonitorService }
elseif ($Uninstall) { Uninstall-MonitorService }
elseif ($Status) { Show-Status }
elseif ($Test) { Run-Test }
else { Start-Monitoring }