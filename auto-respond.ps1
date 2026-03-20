# ============================================================================
# Auto-Respond Security System - 自动安全响应系统
# Version: 2.0.0 - 紧急自动响应机制
# ============================================================================

param(
    [string]$Type,
    [string]$Threat,
    [string]$Details,
    [string]$ThreatLevel = "HIGH",
    [switch]$Manual,
    [switch]$Demo
)

$WorkspacePath = "C:\Users\57684\.openclaw\workspace"
$QuarantinePath = Join-Path $WorkspacePath "quarantine"
$LogPath = Join-Path $WorkspacePath "security-logs"
$AlertLogPath = Join-Path $LogPath "alerts.log"
$ConfigPath = Join-Path $WorkspacePath "env-monitor-config.json"

if (!(Test-Path $QuarantinePath)) { New-Item -ItemType Directory -Path $QuarantinePath -Force | Out-Null }
if (!(Test-Path $LogPath)) { New-Item -ItemType Directory -Path $LogPath -Force | Out-Null }

function Write-AlertLog {
    param([string]$Level, [string]$Message, [string]$ThreatType)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [$ThreatType] $Message"
    
    if ($Level -eq "RESPONSE") { $color = "Yellow" }
    elseif ($Level -eq "ACTION") { $color = "Green" }
    elseif ($Level -eq "ALERT") { $color = "Red" }
    elseif ($Level -eq "CRITICAL") { $color = "DarkRed" }
    elseif ($Level -eq "MEDIUM") { $color = "DarkYellow" }
    else { $color = "White" }
    
    Write-Host $logEntry -ForegroundColor $color -BackgroundColor DarkGray
    Add-Content -Path $AlertLogPath -Value $logEntry
}

function Send-DirectorAlert {
    param([string]$Title, [string]$Message, [string]$Severity = "HIGH", [string]$ActionsTaken = "")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($Message, "Security Alert - $Title", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
    } catch {}
    
    try {
        [System.Console]::Beep(800, 500)
        Start-Sleep -Milliseconds 100
        [System.Console]::Beep(1000, 500)
    } catch {}
    
    $alertFile = Join-Path $LogPath "latest-alert.txt"
    $alertContent = "SECURITY ALERT`nTime: $timestamp`nSeverity: $Severity`nType: $Title`n`n$Message`n`nActions Executed:`n$ActionsTaken"
    Set-Content -Path $alertFile -Value $alertContent -Encoding UTF8
    Write-AlertLog "ALERT" "Alert sent to Director: $Title (Severity: $Severity)" "Alert"
}

function Test-IsRestrictedZone {
    param([string]$FilePath)
    if (!$FilePath) { return $false }
    $restrictedZones = @("C:\Windows\", "C:\Windows")
    foreach ($zone in $restrictedZones) {
        if ($FilePath.StartsWith($zone, [System.StringComparison]::InvariantCultureIgnoreCase)) {
            return $true
        }
    }
    return $false
}

function Terminate-Process {
    param([int]$ProcessId, [string]$ProcessName, [switch]$Force, [string]$ProcessPath)
    
    # 检查是否为系统禁区
    if (Test-IsRestrictedZone -FilePath $ProcessPath) {
        Write-AlertLog "ALERT" "[RESTRICTED ZONE] 检测到 C:\Windows 进程：$ProcessName (PID: $ProcessId) - 仅记录，不终止" "RestrictedZone"
        Send-DirectorAlert -Title "[禁区告警] 系统核心目录进程" -Message "检测到系统核心目录进程：$ProcessName (PID: $ProcessId)`n路径：$ProcessPath`n`n根据安全规则，不对 C:\Windows 执行任何动作，仅记录告警。" -Severity "MEDIUM" -ActionsTaken "已记录日志，未执行终止操作"
        return $false
    }
    
    Write-AlertLog "RESPONSE" "[HIGH] Terminating process: $ProcessName (PID: $ProcessId)" "ProcessTermination"
    try {
        Stop-Process -Id $ProcessId -Force:$Force -ErrorAction Stop
        Write-AlertLog "ACTION" "[HIGH] Process terminated: $ProcessName (PID: $ProcessId)" "ProcessTermination"
        return $true
    } catch {
        Write-AlertLog "CRITICAL" "[HIGH] Process termination failed: $($_.Exception.Message)" "ProcessTermination"
        return $false
    }
}

function Suspend-Process {
    param([int]$ProcessId, [string]$ProcessName, [string]$ProcessPath)
    
    # 检查是否为系统禁区
    if (Test-IsRestrictedZone -FilePath $ProcessPath) {
        Write-AlertLog "ALERT" "[RESTRICTED ZONE] 检测到 C:\Windows 进程：$ProcessName (PID: $ProcessId) - 仅记录，不挂起" "RestrictedZone"
        Send-DirectorAlert -Title "[禁区告警] 系统核心目录进程" -Message "检测到系统核心目录进程：$ProcessName (PID: $ProcessId)`n路径：$ProcessPath`n`n根据安全规则，不对 C:\Windows 执行任何动作，仅记录告警。" -Severity "MEDIUM" -ActionsTaken "已记录日志，未执行挂起操作"
        return $false
    }
    
    Write-AlertLog "RESPONSE" "[MEDIUM] Suspending process: $ProcessName (PID: $ProcessId)" "ProcessSuspension"
    try {
        $process = Get-Process -Id $ProcessId -ErrorAction Stop
        $debugHandle = $process.Threads[0].Suspend()
        Write-AlertLog "ACTION" "[MEDIUM] Process suspended: $ProcessName (PID: $ProcessId) - Awaiting Director confirmation" "ProcessSuspension"
        return $true
    } catch {
        Write-AlertLog "CRITICAL" "[MEDIUM] Process suspension failed: $($_.Exception.Message)" "ProcessSuspension"
        return $false
    }
}

function Quarantine-File {
    param([string]$FilePath, [string]$Reason, [switch]$HighThreat)
    if (!(Test-Path $FilePath)) { return $false }
    
    # 检查是否为系统禁区
    if (Test-IsRestrictedZone -FilePath $FilePath) {
        Write-AlertLog "ALERT" "[RESTRICTED ZONE] 检测到 C:\Windows 文件：$FilePath - 仅记录，不隔离" "RestrictedZone"
        Send-DirectorAlert -Title "[禁区告警] 系统核心目录文件" -Message "检测到系统核心目录文件：$FilePath`n威胁类型：$Reason`n`n根据安全规则，不对 C:\Windows 执行任何动作，仅记录告警。" -Severity "MEDIUM" -ActionsTaken "已记录日志，未执行隔离操作"
        return $false
    }
    
    $threatLabel = if ($HighThreat) { "[HIGH]" } else { "[MEDIUM]" }
    Write-AlertLog "RESPONSE" "$threatLabel Quarantining file: $FilePath" "Quarantine"
    try {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $quarantineDir = Join-Path $QuarantinePath "quarantine_$timestamp"
        New-Item -ItemType Directory -Path $quarantineDir -Force | Out-Null
        
        $fileName = Split-Path $FilePath -Leaf
        Copy-Item -Path $FilePath -Destination (Join-Path $quarantineDir $fileName) -Force
        Remove-Item -Path $FilePath -Force
        
        $lockFile = Join-Path $quarantineDir "$fileName.locked"
        "QUARANTINED: $timestamp`nReason: $Reason`nThreatLevel: $(if($HighThreat){'HIGH'}else{'MEDIUM'})" | Set-Content -Path $lockFile -Encoding UTF8
        
        Write-AlertLog "ACTION" "$threatLabel File quarantined: $fileName" "Quarantine"
        return $true
    } catch {
        Write-AlertLog "CRITICAL" "$threatLabel Quarantine failed: $($_.Exception.Message)" "Quarantine"
        return $false
    }
}

function Mark-File-Suspicious {
    param([string]$FilePath, [string]$Reason)
    if (!(Test-Path $FilePath)) { return $false }
    
    # 检查是否为系统禁区
    if (Test-IsRestrictedZone -FilePath $FilePath) {
        Write-AlertLog "ALERT" "[RESTRICTED ZONE] 检测到 C:\Windows 文件：$FilePath - 仅记录，不标记" "RestrictedZone"
        Send-DirectorAlert -Title "[禁区告警] 系统核心目录文件" -Message "检测到系统核心目录文件：$FilePath`n威胁类型：$Reason`n`n根据安全规则，不对 C:\Windows 执行任何动作，仅记录告警。" -Severity "MEDIUM" -ActionsTaken "已记录日志，未执行标记操作"
        return $false
    }
    
    Write-AlertLog "RESPONSE" "[MEDIUM] Marking file as suspicious: $FilePath" "FileMark"
    try {
        $markFile = "$FilePath.suspicious"
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "SUSPICIOUS FILE MARKER`nTime: $timestamp`nReason: $Reason`nStatus: PENDING_DIRECTOR_REVIEW`n`nDO NOT DELETE THIS MARKER" | Set-Content -Path $markFile -Encoding UTF8
        
        Write-AlertLog "ACTION" "[MEDIUM] File marked as suspicious: $FilePath - Awaiting Director confirmation" "FileMark"
        return $true
    } catch {
        Write-AlertLog "CRITICAL" "[MEDIUM] File marking failed: $($_.Exception.Message)" "FileMark"
        return $false
    }
}

function Block-NetworkConnection {
    param([string]$RemoteAddress, [int]$RemotePort, [int]$ProcessId)
    Write-AlertLog "RESPONSE" "[HIGH] Blocking network connection: ${RemoteAddress}:${RemotePort}" "NetworkBlock"
    try {
        $ruleName = "SecurityBlock_$((Get-Date).ToString('yyyyMMdd_HHmmss'))"
        netsh advfirewall firewall add rule name="$ruleName" dir=out action=block remoteip="$RemoteAddress" | Out-Null
        Write-AlertLog "ACTION" "[HIGH] Firewall rule added: $RemoteAddress" "NetworkBlock"
        return $true
    } catch {
        Write-AlertLog "CRITICAL" "[HIGH] Network block failed: $($_.Exception.Message)" "NetworkBlock"
        return $false
    }
}

function Get-AutoRespondConfig {
    if (Test-Path $ConfigPath) {
        try {
            $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
            return $config.autoRespond
        } catch {
            Write-AlertLog "CRITICAL" "Config file read failed, using defaults" "Config"
        }
    }
    return @{
        enabled = $true
        highThreat = @{ killProcess = $true; quarantineFile = $true; blockNetwork = $true; alertUser = $true }
        mediumThreat = @{ suspendProcess = $true; markFile = $true; alertUser = $true; waitForConfirm = $true }
    }
}

function Handle-HighThreat {
    param([string]$Type, [string]$Threat, [object]$Details)
    Write-AlertLog "CRITICAL" "[HIGH THREAT] Auto-respond initiated - Type: $Type, Threat: $Threat" "HighThreatDetection"
    
    $config = Get-AutoRespondConfig
    if (!$config.enabled -or !$config.highThreat.alertUser) {
        Write-AlertLog "CRITICAL" "[HIGH] Auto-respond disabled, logging threat only" "HighThreatDisabled"
        return
    }
    
    $actionsTaken = @()
    $alertMessage = ""
    
    if ($Type -eq "Process") {
        $processName = $Details.Name
        $processId = $Details.Id
        $processPath = $Details.Path
        $alertMessage = "Malicious process detected: $processName (PID: $processId)"
        if ($config.highThreat.killProcess -and $processId) {
            if (Terminate-Process -ProcessId $processId -ProcessName $processName -Force -ProcessPath $processPath) {
                $actionsTaken += "Process terminated"
            } else {
                $actionsTaken += "Process termination failed"
            }
        }
    }
    elseif ($Type -eq "File") {
        $filePath = $Details.Path
        $alertMessage = "Malicious file detected: $filePath"
        if ($config.highThreat.quarantineFile) {
            if (Quarantine-File -FilePath $filePath -Reason $Threat -HighThreat) {
                $actionsTaken += "File quarantined"
            } else {
                $actionsTaken += "File quarantine failed"
            }
        }
    }
    elseif ($Type -eq "Network") {
        $remoteAddress = $Details.RemoteAddress
        $remotePort = $Details.RemotePort
        $alertMessage = "Suspicious connection detected: ${remoteAddress}:${remotePort}"
        if ($config.highThreat.blockNetwork) {
            if (Block-NetworkConnection -RemoteAddress $remoteAddress -RemotePort $remotePort) {
                $actionsTaken += "Connection blocked"
            } else {
                $actionsTaken += "Connection block failed"
            }
        }
    }
    elseif ($Type -eq "Behavior") {
        $alertMessage = "Suspicious behavior detected: $Threat"
        $actionsTaken += "Behavior logged for analysis"
    }
    
    $fullAlertMessage = "$alertMessage`n`nActions Executed:`n$($actionsTaken -join "`n")"
    Send-DirectorAlert -Title "[HIGH] $Type Threat - $Threat" -Message $fullAlertMessage -Severity "CRITICAL" -ActionsTaken ($actionsTaken -join ", ")
    
    Write-AlertLog "ACTION" "[HIGH] Threat response completed" "HighThreatResponse"
}

function Handle-MediumThreat {
    param([string]$Type, [string]$Threat, [object]$Details)
    Write-AlertLog "MEDIUM" "[MEDIUM THREAT] Auto-respond initiated - Type: $Type, Threat: $Threat" "MediumThreatDetection"
    
    $config = Get-AutoRespondConfig
    if (!$config.enabled -or !$config.mediumThreat.alertUser) {
        Write-AlertLog "CRITICAL" "[MEDIUM] Auto-respond disabled, logging threat only" "MediumThreatDisabled"
        return
    }
    
    $actionsTaken = @()
    $alertMessage = ""
    
    if ($Type -eq "Process") {
        $processName = $Details.Name
        $processId = $Details.Id
        $processPath = $Details.Path
        $alertMessage = "Suspicious process detected: $processName (PID: $processId)"
        if ($config.mediumThreat.suspendProcess -and $processId) {
            if (Suspend-Process -ProcessId $processId -ProcessName $processName -ProcessPath $processPath) {
                $actionsTaken += "Process suspended (awaiting Director confirmation)"
            } else {
                $actionsTaken += "Process suspension failed"
            }
        }
    }
    elseif ($Type -eq "File") {
        $filePath = $Details.Path
        $alertMessage = "Suspicious file detected: $filePath"
        if ($config.mediumThreat.markFile) {
            if (Mark-File-Suspicious -FilePath $filePath -Reason $Threat) {
                $actionsTaken += "File marked as suspicious (awaiting Director confirmation)"
            } else {
                $actionsTaken += "File marking failed"
            }
        }
    }
    elseif ($Type -eq "Network") {
        $remoteAddress = $Details.RemoteAddress
        $remotePort = $Details.RemotePort
        $alertMessage = "Suspicious connection detected: ${remoteAddress}:${remotePort}"
        $actionsTaken += "Connection logged (awaiting Director confirmation)"
    }
    elseif ($Type -eq "Behavior") {
        $alertMessage = "Suspicious behavior detected: $Threat"
        $actionsTaken += "Behavior logged (awaiting Director confirmation)"
    }
    
    $fullAlertMessage = "$alertMessage`n`nActions Executed:`n$($actionsTaken -join "`n")`n`nAwaiting Director decision on next steps."
    Send-DirectorAlert -Title "[MEDIUM] $Type Threat - $Threat" -Message $fullAlertMessage -Severity "MEDIUM" -ActionsTaken ($actionsTaken -join ", ")
    
    Write-AlertLog "ACTION" "[MEDIUM] Threat response completed - Awaiting Director confirmation" "MediumThreatResponse"
}

function Handle-Threat {
    param([string]$Type, [string]$Threat, [object]$Details, [string]$ThreatLevel = "HIGH")
    
    if ($ThreatLevel -eq "HIGH" -or $ThreatLevel -eq "CRITICAL") {
        Handle-HighThreat -Type $Type -Threat $Threat -Details $Details
    }
    elseif ($ThreatLevel -eq "MEDIUM") {
        Handle-MediumThreat -Type $Type -Threat $Threat -Details $Details
    }
    else {
        Write-AlertLog "MEDIUM" "Unknown threat level: $ThreatLevel, treating as MEDIUM" "UnknownThreatLevel"
        Handle-MediumThreat -Type $Type -Threat $Threat -Details $Details
    }
}

function Run-Demo {
    Write-Host "`n========================================================" -ForegroundColor Magenta
    Write-Host "     Auto-Respond Demo - Emergency Auto-Response System" -ForegroundColor Magenta
    Write-Host "========================================================`n" -ForegroundColor Magenta
    
    Write-Host "`n[DEMO 1] HIGH Threat - Malicious Process..." -ForegroundColor Cyan
    $mockProcess = New-Object PSObject -Property @{Name = "malware_test.exe"; Id = 12345; Path = "C:\temp\malware_test.exe"}
    Handle-HighThreat -Type "Process" -Threat "BlacklistedProcess" -Details $mockProcess
    
    Start-Sleep -Seconds 2
    
    Write-Host "`n[DEMO 2] HIGH Threat - Malicious File..." -ForegroundColor Cyan
    $testFilePath = Join-Path $QuarantinePath "test_suspicious.exe"
    "This is a test file" | Set-Content -Path $testFilePath -Encoding UTF8
    $mockFile = New-Object PSObject -Property @{Path = $testFilePath; Hash = "test123"}
    Handle-HighThreat -Type "File" -Threat "SuspiciousFile" -Details $mockFile
    
    Start-Sleep -Seconds 2
    
    Write-Host "`n[DEMO 3] MEDIUM Threat - Suspicious Process..." -ForegroundColor Cyan
    $mockProcess2 = New-Object PSObject -Property @{Name = "unknown_app.exe"; Id = 54321; Path = "C:\temp\unknown_app.exe"}
    Handle-MediumThreat -Type "Process" -Threat "UnknownProcess" -Details $mockProcess2
    
    Start-Sleep -Seconds 2
    
    Write-Host "`n[DEMO 4] HIGH Threat - Suspicious Network..." -ForegroundColor Cyan
    $mockNetwork = New-Object PSObject -Property @{RemoteAddress = "192.168.100.100"; RemotePort = 4444; OwningProcess = 6789}
    Handle-HighThreat -Type "Network" -Threat "SuspiciousPort" -Details $mockNetwork
    
    Write-Host "`n[DEMO] Demo complete! Check logs and quarantine." -ForegroundColor Green
    Write-Host "Logs: $LogPath" -ForegroundColor Gray
    Write-Host "Quarantine: $QuarantinePath" -ForegroundColor Gray
}

function Run-Manual {
    Write-Host "`n[MANUAL] Manual Response Mode" -ForegroundColor Yellow
    Write-Host "Commands:"
    Write-Host "  HIGH Threat:"
    Write-Host "    Handle-HighThreat -Type <Process|File|Network> -Threat <threat> -Details <JSON>"
    Write-Host "  MEDIUM Threat:"
    Write-Host "    Handle-MediumThreat -Type <Process|File|Network> -Threat <threat> -Details <JSON>"
    Write-Host "  Individual Operations:"
    Write-Host "    Terminate-Process -ProcessId <PID> -Force"
    Write-Host "    Suspend-Process -ProcessId <PID>"
    Write-Host "    Quarantine-File -FilePath <path> -HighThreat"
    Write-Host "    Mark-File-Suspicious -FilePath <path>"
    Write-Host "    Block-NetworkConnection -RemoteAddress <IP> -RemotePort <port>"
    Write-Host "    Send-DirectorAlert -Title <title> -Message <message>"
}

if ($Demo) { Run-Demo }
elseif ($Manual) { Run-Manual }
elseif ($Type -and $Threat) {
    $detailsObj = $Details | ConvertFrom-Json
    Handle-Threat -Type $Type -Threat $Threat -Details $detailsObj -ThreatLevel $ThreatLevel
}
else {
    Write-Host "`nAuto-Respond Security System v2.0.0 - Emergency Auto-Response"
    Write-Host "Usage: .\auto-respond.ps1 -Type <type> -Threat <threat> -Details <JSON> -ThreatLevel <HIGH|MEDIUM>"
    Write-Host "       .\auto-respond.ps1 -Demo"
    Write-Host "       .\auto-respond.ps1 -Manual"
    Write-Host "`nConfig Status: Auto-respond ENABLED (env-monitor-config.json)"
}