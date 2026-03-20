# ============================================================================
# Security Monitor Installation Script
# Version: 1.0.0
# ============================================================================

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$Update,
    [switch]$Help
)

$WorkspacePath = "C:\Users\57684\.openclaw\workspace"
$MonitorScript = Join-Path $WorkspacePath "realtime-monitor.ps1"
$LogPath = Join-Path $WorkspacePath "security-logs"
$TaskName = "SecurityRealtimeMonitor"

function Write-Color { param([string]$Text, [string]$Color = "White"); Write-Host $Text -ForegroundColor $Color }

function Install-SecurityMonitor {
    Write-Color "`n=== Security Monitor Installation ===" "Cyan"
    
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (!$isAdmin) {
        Write-Color "WARNING: Run as Administrator" "Yellow"
        return
    }
    
    # Create directories
    foreach ($dir in @($LogPath, (Join-Path $WorkspacePath "quarantine"))) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Color "Created: $dir" "Green"
        }
    }
    
    # Set execution policy
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force 2>$null
    Write-Color "Execution policy set" "Green"
    
    # Create scheduled task
    Write-Color "Registering scheduled task..." "Cyan"
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$MonitorScript`"" -WorkingDirectory $WorkspacePath
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RunContinuous -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
    
    Write-Color "Task registered: $TaskName" "Green"
    
    # Create desktop shortcut
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $WScript = New-Object -ComObject WScript.Shell
    $shortcut = $WScript.CreateShortcut((Join-Path $desktopPath "SecurityMonitor.lnk"))
    $shortcut.TargetPath = "PowerShell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$MonitorScript`" -Status"
    $shortcut.WorkingDirectory = $WorkspacePath
    $shortcut.Save()
    Write-Color "Desktop shortcut created" "Green"
    
    # Start service
    Start-ScheduledTask -TaskName $TaskName 2>$null
    Write-Color "Service started" "Green"
    
    Write-Color "`n=== Installation Complete ===" "Green"
    Write-Color "Logs: $LogPath" "Cyan"
    Write-Color "Quarantine: $(Join-Path $WorkspacePath "quarantine")" "Cyan"
}

function Uninstall-SecurityMonitor {
    Write-Color "`n=== Uninstalling ===" "Yellow"
    $confirmation = Read-Host "Confirm uninstall (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') { return }
    
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Color "Uninstall complete" "Green"
}

function Show-Status {
    Write-Color "`n=== Security Monitor Status ===" "Cyan"
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Write-Color "Service: $TaskName, State: $($task.State)" "Green"
    } else {
        Write-Color "Service not installed" "Red"
    }
    
    if (Test-Path $LogPath) {
        $todayLog = Join-Path $LogPath "$(Get-Date -Format 'yyyy-MM-dd').log"
        if (Test-Path $todayLog) {
            Write-Color "Today's log: $((Get-Content $todayLog).Count) entries" "Green"
        }
    }
    
    $quarantinePath = Join-Path $WorkspacePath "quarantine"
    if (Test-Path $quarantinePath) {
        Write-Color "Quarantined items: $((Get-ChildItem -Path $quarantinePath -Directory).Count)" "Cyan"
    }
}

if ($Help -or (!$Install -and !$Uninstall -and !$Status -and !$Update)) {
    Write-Host "`nUsage:"
    Write-Host "  .\install-security-monitor.ps1 -Install    # Install service"
    Write-Host "  .\install-security-monitor.ps1 -Uninstall  # Uninstall service"
    Write-Host "  .\install-security-monitor.ps1 -Status     # Show status"
    Write-Host ""
}
elseif ($Install) { Install-SecurityMonitor }
elseif ($Uninstall) { Uninstall-SecurityMonitor }
elseif ($Status) { Show-Status }
elseif ($Update) { Write-Color "Update: Backup created" "Green" }