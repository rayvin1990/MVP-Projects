# System Configuration Checker Module
# Author: Nia (AI Assistant)
# Version: 1.0.0

param(
    [string]$ConfigPath = "$PSScriptRoot\env-monitor-config.json",
    [switch]$Check,
    [switch]$Monitor
)

function Get-Config {
    param([string]$Path)
    if (Test-Path $Path) {
        return Get-Content $Path | ConvertFrom-Json
    }
    throw "Config file not found: $Path"
}

function Initialize-Log {
    param([string]$LogPath)
    if (!(Test-Path $LogPath)) {
        New-Item -ItemType Directory -Force -Path $LogPath | Out-Null
    }
    $logFile = Join-Path $LogPath "system-checker-$(Get-Date -Format 'yyyyMMdd').log"
    return $logFile
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$LogFile
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logEntry
    if ($Level -eq "WARNING" -or $Level -eq "ALERT") {
        Write-Host $logEntry -ForegroundColor $(if ($Level -eq "ALERT") { "Red" } else { "Yellow" })
    }
}

function Check-RegistryRunKeys {
    param([string]$LogFile)
    
    Write-Log "Checking registry run keys..." "INFO" $LogFile
    
    $runKeys = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"
    )
    
    $results = @()
    $suspicious = @()
    
    foreach ($key in $runKeys) {
        try {
            if (Test-Path $key) {
                $items = Get-ItemProperty -Path $key -ErrorAction Stop
                
                foreach ($prop in $items.PSObject.Properties) {
                    if ($prop.Name -notmatch "^PS" -and $prop.Value) {
                        $result = [PSCustomObject]@{
                            RegistryKey = $key
                            Name = $prop.Name
                            Value = $prop.Value
                            Type = "Registry Run"
                        }
                        $results += $result
                        
                        $value = $prop.Value
                        $isSuspicious = $false
                        $reasons = @()
                        
                        if ($value -match "Temp|AppData\\Local\\Temp|Downloads") {
                            $isSuspicious = $true
                            $reasons += "Located in temp directory"
                        }
                        
                        if ($value -match "\.(exe|bat|cmd|vbs|ps1|scr|hta)$") {
                            if ($value -notmatch "^(C:\\Program Files|C:\\Program Files \(x86\)|C:\\Windows)") {
                                $isSuspicious = $true
                                $reasons += "Executable in non-standard location"
                            }
                        }
                        
                        if ($isSuspicious) {
                            $suspicious += [PSCustomObject]@{
                                Item = $result
                                Reasons = $reasons
                            }
                            Write-Log "Suspicious registry: $($prop.Name) = $value - $($reasons -join ', ')" "ALERT" $LogFile
                        }
                    }
                }
            }
        } catch {
            Write-Log "Cannot read registry: $key - $($_.Exception.Message)" "WARNING" $LogFile
        }
    }
    
    return @{ All = $results; Suspicious = $suspicious }
}

function Check-StartupFolder {
    param([string]$LogFile)
    
    Write-Log "Checking startup folders..." "INFO" $LogFile
    
    $startupFolders = @(
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup",
        "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
    )
    
    $results = @()
    $suspicious = @()
    
    foreach ($folder in $startupFolders) {
        if (Test-Path $folder) {
            $items = Get-ChildItem -Path $folder -ErrorAction SilentlyContinue
            
            foreach ($item in $items) {
                $result = [PSCustomObject]@{
                    Path = $item.FullName
                    Name = $item.Name
                    Type = "Startup Folder"
                }
                $results += $result
                
                $isSuspicious = $false
                $reasons = @()
                
                if ($item.Extension -match "\.(exe|bat|cmd|vbs|ps1|scr|hta|lnk)$") {
                    if ($item.DirectoryName -match "Temp|Downloads") {
                        $isSuspicious = $true
                        $reasons += "Located in suspicious directory"
                    }
                }
                
                if ($isSuspicious) {
                    $suspicious += [PSCustomObject]@{
                        Item = $result
                        Reasons = $reasons
                    }
                    Write-Log "Suspicious startup: $($item.FullName)" "ALERT" $LogFile
                }
            }
        }
    }
    
    return @{ All = $results; Suspicious = $suspicious }
}

function Check-ScheduledTasks {
    param([string]$LogFile)
    
    Write-Log "Checking scheduled tasks..." "INFO" $LogFile
    
    $results = @()
    $suspicious = @()
    
    try {
        $tasks = Get-ScheduledTask -ErrorAction SilentlyContinue
        
        foreach ($task in $tasks) {
            try {
                $taskInfo = Get-ScheduledTaskInfo -TaskName $task.TaskName -TaskPath $task.TaskPath -ErrorAction SilentlyContinue
                
                $result = [PSCustomObject]@{
                    Name = $task.TaskName
                    Path = $task.TaskPath
                    State = $task.State
                    Action = if ($task.Actions) { $task.Actions.Execute } else { "N/A" }
                    Type = "Scheduled Task"
                }
                $results += $result
                
                $isSuspicious = $false
                $reasons = @()
                
                if ($task.Settings.Hidden) {
                    $isSuspicious = $true
                    $reasons += "Hidden task"
                }
                
                if ($task.Actions.Execute -match "Temp|AppData\\Local\\Temp|Downloads") {
                    $isSuspicious = $true
                    $reasons += "Action in temp directory"
                }
                
                if ($isSuspicious) {
                    $suspicious += [PSCustomObject]@{
                        Item = $result
                        Reasons = $reasons
                    }
                    Write-Log "Suspicious task: $($task.TaskName) - $($reasons -join ', ')" "ALERT" $LogFile
                }
            } catch { }
        }
    } catch {
        Write-Log "Cannot get tasks: $($_.Exception.Message)" "WARNING" $LogFile
    }
    
    return @{ All = $results; Suspicious = $suspicious }
}

function Check-Services {
    param([string]$LogFile)
    
    Write-Log "Checking services..." "INFO" $LogFile
    
    $results = @()
    $suspicious = @()
    
    try {
        $services = Get-Service | Where-Object { $_.StartType -eq "Automatic" -or $_.Status -eq "Running" }
        
        foreach ($service in $services) {
            try {
                $serviceInfo = Get-WmiObject -Class Win32_Service -Filter "Name='$($service.Name)'" -ErrorAction SilentlyContinue
                
                $result = [PSCustomObject]@{
                    Name = $service.Name
                    DisplayName = $service.DisplayName
                    Status = $service.Status
                    PathName = if ($serviceInfo) { $serviceInfo.PathName } else { "N/A" }
                    Type = "Service"
                }
                $results += $result
                
                $isSuspicious = $false
                $reasons = @()
                
                if ($serviceInfo) {
                    if ($serviceInfo.PathName -match "Temp|AppData\\Local\\Temp|Downloads") {
                        $isSuspicious = $true
                        $reasons += "Service in temp directory"
                    }
                    
                    if (!$serviceInfo.Description -or $serviceInfo.Description -eq "") {
                        $isSuspicious = $true
                        $reasons += "No description"
                    }
                }
                
                if ($isSuspicious) {
                    $suspicious += [PSCustomObject]@{
                        Item = $result
                        Reasons = $reasons
                    }
                    Write-Log "Suspicious service: $($service.Name)" "ALERT" $LogFile
                }
            } catch { }
        }
    } catch {
        Write-Log "Cannot get services: $($_.Exception.Message)" "WARNING" $LogFile
    }
    
    return @{ All = $results; Suspicious = $suspicious }
}

function Show-SystemCheckResults {
    param(
        [object]$RegistryResults,
        [object]$StartupResults,
        [object]$TaskResults,
        [object]$ServiceResults,
        [string]$LogFile
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "      SYSTEM CONFIGURATION CHECK" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $totalSuspicious = 0
    
    Write-Host "[REGISTRY RUN KEYS]" -ForegroundColor $(if ($RegistryResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($RegistryResults.All.Count)" -ForegroundColor White
    Write-Host "  Suspicious: $($RegistryResults.Suspicious.Count)" -ForegroundColor $(if ($RegistryResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    if ($RegistryResults.Suspicious.Count -gt 0) {
        foreach ($item in $RegistryResults.Suspicious) {
            Write-Host "  ! $($item.Item.Name) = $($item.Item.Value)" -ForegroundColor Red
        }
    }
    $totalSuspicious += $RegistryResults.Suspicious.Count
    
    Write-Host "`n[STARTUP FOLDER]" -ForegroundColor $(if ($StartupResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($StartupResults.All.Count)" -ForegroundColor White
    Write-Host "  Suspicious: $($StartupResults.Suspicious.Count)" -ForegroundColor $(if ($StartupResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    $totalSuspicious += $StartupResults.Suspicious.Count
    
    Write-Host "`n[SCHEDULED TASKS]" -ForegroundColor $(if ($TaskResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($TaskResults.All.Count)" -ForegroundColor White
    Write-Host "  Suspicious: $($TaskResults.Suspicious.Count)" -ForegroundColor $(if ($TaskResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    if ($TaskResults.Suspicious.Count -gt 0) {
        foreach ($item in $TaskResults.Suspicious) {
            Write-Host "  ! $($item.Item.Name)" -ForegroundColor Red
            Write-Host "    Action: $($item.Item.Action)" -ForegroundColor Yellow
        }
    }
    $totalSuspicious += $TaskResults.Suspicious.Count
    
    Write-Host "`n[SERVICES]" -ForegroundColor $(if ($ServiceResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($ServiceResults.All.Count)" -ForegroundColor White
    Write-Host "  Suspicious: $($ServiceResults.Suspicious.Count)" -ForegroundColor $(if ($ServiceResults.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    if ($ServiceResults.Suspicious.Count -gt 0) {
        foreach ($item in $ServiceResults.Suspicious) {
            Write-Host "  ! $($item.Item.Name) ($($item.Item.DisplayName))" -ForegroundColor Red
        }
    }
    $totalSuspicious += $ServiceResults.Suspicious.Count
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Summary:" -ForegroundColor White
    Write-Host "  Registry: $($RegistryResults.All.Count) ($($RegistryResults.Suspicious.Count) suspicious)" -ForegroundColor White
    Write-Host "  Startup: $($StartupResults.All.Count) ($($StartupResults.Suspicious.Count) suspicious)" -ForegroundColor White
    Write-Host "  Tasks: $($TaskResults.All.Count) ($($TaskResults.Suspicious.Count) suspicious)" -ForegroundColor White
    Write-Host "  Services: $($ServiceResults.All.Count) ($($ServiceResults.Suspicious.Count) suspicious)" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    Write-Host "  TOTAL SUSPICIOUS: $totalSuspicious" -ForegroundColor $(if ($totalSuspicious -gt 0) { "Red" } else { "Green" })
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Log "System check complete - Total suspicious: $totalSuspicious" "INFO" $LogFile
    
    return $totalSuspicious
}

function Invoke-SystemChecker {
    param(
        [switch]$Check,
        [switch]$Monitor
    )
    
    $config = Get-Config -Path $ConfigPath
    $logFile = Initialize-Log -LogPath $config.monitoring.log_path
    
    Write-Host "Starting system configuration check..." -ForegroundColor Cyan
    Write-Log "Starting system configuration check" "INFO" $LogFile
    
    $registryResults = Check-RegistryRunKeys -LogFile $logFile
    $startupResults = Check-StartupFolder -LogFile $logFile
    $taskResults = Check-ScheduledTasks -LogFile $logFile
    $serviceResults = Check-Services -LogFile $logFile
    
    $suspiciousCount = Show-SystemCheckResults `
        -RegistryResults $registryResults `
        -StartupResults $startupResults `
        -TaskResults $taskResults `
        -ServiceResults $serviceResults `
        -LogFile $logFile
    
    if ($Monitor) {
        Write-Host "Starting continuous monitoring..." -ForegroundColor Cyan
        $interval = $config.system_checker.check_interval_minutes * 60
        
        while ($true) {
            Start-Sleep -Seconds $interval
            Write-Host "`nRunning periodic check..." -ForegroundColor Cyan
            
            $registryResults = Check-RegistryRunKeys -LogFile $logFile
            $startupResults = Check-StartupFolder -LogFile $logFile
            $taskResults = Check-ScheduledTasks -LogFile $logFile
            $serviceResults = Check-Services -LogFile $logFile
            
            $newCount = Show-SystemCheckResults `
                -RegistryResults $registryResults `
                -StartupResults $startupResults `
                -TaskResults $taskResults `
                -ServiceResults $serviceResults `
                -LogFile $logFile
            
            if ($newCount -gt $suspiciousCount) {
                Write-Host "WARNING: New suspicious items detected!" -ForegroundColor Red
                Write-Log "WARNING: New suspicious items (was: $suspiciousCount, now: $newCount)" "ALERT" $logFile
            }
            $suspiciousCount = $newCount
        }
    }
}

Invoke-SystemChecker -Check:$Check -Monitor:$Monitor
