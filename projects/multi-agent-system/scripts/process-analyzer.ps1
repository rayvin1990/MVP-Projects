# Process Analysis Module - Detect abnormal process behavior
# Author: Nia (AI Assistant)
# Version: 1.0.0

param(
    [string]$ConfigPath = "$PSScriptRoot\env-monitor-config.json",
    [switch]$Analyze,
    [switch]$Monitor,
    [switch]$List
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
    $logFile = Join-Path $LogPath "process-analyzer-$(Get-Date -Format 'yyyyMMdd').log"
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

function Get-AllProcesses {
    return Get-Process | ForEach-Object {
        try {
            $proc = $_
            $mainModule = $null
            try {
                $mainModule = $proc.MainModule
            } catch { }
            
            [PSCustomObject]@{
                Id = $proc.Id
                Name = $proc.Name
                Path = if ($mainModule) { $mainModule.FileName } else { "N/A" }
                Company = if ($mainModule -and $mainModule.FileVersionInfo) { $mainModule.FileVersionInfo.CompanyName } else { "Unknown" }
                CPU = $proc.CPU
                WorkingSet = $proc.WorkingSet64
                StartTime = $proc.StartTime
                IsSystem = $proc.SessionId -eq 0
            }
        } catch {
            [PSCustomObject]@{
                Id = $_.Id
                Name = $_.Name
                Path = "N/A"
                Company = "Unknown"
                CPU = $null
                WorkingSet = $_.WorkingSet64
                StartTime = $_.StartTime
                IsSystem = $false
            }
        }
    }
}

function Test-ProcessTrust {
    param(
        [object]$Process,
        [string[]]$Whitelist
    )
    if ($Whitelist -contains $Process.Name) { return $true }
    if ($Process.Company -and $Process.Company -ne "Unknown") { return $true }
    if ($Process.IsSystem) { return $true }
    return $false
}

function Find-HighResourceProcesses {
    param(
        [object[]]$Processes,
        [int]$CpuThreshold = 80,
        [int]$MemoryThresholdPercent = 70
    )
    $totalMemory = (Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize * 1KB
    $memoryThreshold = $totalMemory * ($MemoryThresholdPercent / 100)
    $highResource = @()
    
    foreach ($proc in $Processes) {
        $issues = @()
        if ($proc.CPU -and $proc.CPU -gt $CpuThreshold) {
            $issues += "High CPU: $($proc.CPU)%"
        }
        if ($proc.WorkingSet -gt $memoryThreshold) {
            $issues += "High Memory: $([math]::Round($proc.WorkingSet / 1MB, 2)) MB"
        }
        if ($issues.Count -gt 0) {
            $highResource += [PSCustomObject]@{
                Process = $proc
                Issues = $issues
            }
        }
    }
    return $highResource
}

function Find-SuspiciousProcesses {
    param(
        [object[]]$Processes,
        [string[]]$Whitelist
    )
    $suspicious = @()
    
    foreach ($proc in $Processes) {
        $reasons = @()
        if (!(Test-ProcessTrust -Process $proc -Whitelist $Whitelist)) {
            $reasons += "Unknown signature"
        }
        if ($proc.Path -ne "N/A") {
            $suspiciousPaths = @("Temp", "AppData\Local\Temp", "Downloads")
            foreach ($sp in $suspiciousPaths) {
                if ($proc.Path -like "*$sp*") {
                    $reasons += "Located in suspicious directory: $sp"
                    break
                }
            }
        }
        if ($reasons.Count -gt 0) {
            $suspicious += [PSCustomObject]@{
                Process = $proc
                Reasons = $reasons
            }
        }
    }
    return $suspicious
}

function List-Processes {
    param([object[]]$Processes)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "         PROCESS LIST" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $table = $Processes | Select-Object Id, Name, Company, 
        @{N='Memory(MB)';E={[math]::Round($_.WorkingSet/1MB,2)}},
        StartTime | Sort-Object WorkingSet -Descending
    
    $table | Format-Table -AutoSize
    Write-Host "`nTotal: $($Processes.Count) processes" -ForegroundColor Green
}

function Analyze-Processes {
    param(
        [object[]]$Processes,
        [string[]]$Whitelist,
        [int]$CpuThreshold,
        [int]$MemoryThreshold,
        [string]$LogFile
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "      PROCESS SECURITY ANALYSIS" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "[HIGH RESOURCE PROCESSES]" -ForegroundColor Yellow
    $highResource = Find-HighResourceProcesses -Processes $Processes -CpuThreshold $CpuThreshold -MemoryThresholdPercent $MemoryThreshold
    if ($highResource.Count -gt 0) {
        foreach ($hr in $highResource) {
            Write-Host "  $($hr.Process.Name) (PID: $($hr.Process.Id))" -ForegroundColor Red
            foreach ($issue in $hr.Issues) {
                Write-Host "    - $issue" -ForegroundColor Yellow
            }
            Write-Log "High resource: $($hr.Process.Name) (PID: $($hr.Process.Id)) - $($hr.Issues -join ', ')" "WARNING" $LogFile
        }
    } else {
        Write-Host "  None detected" -ForegroundColor Green
    }
    
    Write-Host "`n[SUSPICIOUS PROCESSES]" -ForegroundColor Yellow
    $suspicious = Find-SuspiciousProcesses -Processes $Processes -Whitelist $Whitelist
    if ($suspicious.Count -gt 0) {
        foreach ($sp in $suspicious) {
            Write-Host "  $($sp.Process.Name) (PID: $($sp.Process.Id))" -ForegroundColor Red
            foreach ($reason in $sp.Reasons) {
                Write-Host "    - $reason" -ForegroundColor Red
            }
            Write-Log "Suspicious: $($sp.Process.Name) (PID: $($sp.Process.Id)) - $($sp.Reasons -join ', ')" "ALERT" $LogFile
        }
    } else {
        Write-Host "  None detected" -ForegroundColor Green
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Summary:" -ForegroundColor White
    Write-Host "  Total processes: $($Processes.Count)" -ForegroundColor White
    Write-Host "  High resource: $($highResource.Count)" -ForegroundColor $(if ($highResource.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  Suspicious: $($suspicious.Count)" -ForegroundColor $(if ($suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Get-MalwareHashDB {
    param([string]$DbPath)
    $hashes = @{}
    if (Test-Path $DbPath) {
        Get-Content $DbPath | ForEach-Object {
            $line = $_.Trim()
            if ($line -and $line -notmatch "^#") {
                $parts = $line -split ","
                if ($parts.Count -ge 1) {
                    $hashes[$parts[0].Trim()] = $parts[1..($parts.Count-1)] -join ","
                }
            }
        }
    }
    return $hashes
}

function Invoke-ProcessAnalyzer {
    param(
        [switch]$Analyze,
        [switch]$Monitor,
        [switch]$List
    )
    
    $config = Get-Config -Path $ConfigPath
    $logFile = Initialize-Log -LogPath $config.monitoring.log_path
    $malwareDbPath = Join-Path $PSScriptRoot $config.file_watcher.malware_hash_db
    $malwareDB = Get-MalwareHashDB -DbPath $malwareDbPath
    $whitelist = $config.process_analyzer.whitelist_processes
    
    Write-Host "Gathering process information..." -ForegroundColor Cyan
    $processes = Get-AllProcesses
    
    if ($List) {
        List-Processes -Processes $processes
    }
    elseif ($Analyze -or (!$Monitor -and !$List)) {
        Analyze-Processes `
            -Processes $processes `
            -Whitelist $whitelist `
            -MalwareDB $malwareDB `
            -CpuThreshold $config.process_analyzer.cpu_threshold_percent `
            -MemoryThreshold $config.process_analyzer.memory_threshold_percent `
            -LogFile $logFile
    }
    
    if ($Monitor) {
        Write-Host "Starting real-time process monitor..." -ForegroundColor Cyan
        Write-Log "Starting real-time process monitor" "INFO" $LogFile
        $lastAlert = @{}
        
        while ($true) {
            $processes = Get-AllProcesses
            $suspicious = Find-SuspiciousProcesses -Processes $processes -Whitelist $whitelist
            
            foreach ($sp in $suspicious) {
                $key = "$($sp.Process.Name)_$($sp.Process.Id)"
                $now = Get-Date
                if (!$lastAlert.ContainsKey($key) -or ($now - $lastAlert[$key]).TotalMinutes -gt 5) {
                    Write-Log "Real-time - Suspicious: $($sp.Process.Name) (PID: $($sp.Process.Id))" "ALERT" $LogFile
                    Write-Host "Warning: Suspicious process: $($sp.Process.Name) (PID: $($sp.Process.Id))" -ForegroundColor Red
                    $lastAlert[$key] = $now
                }
            }
            Start-Sleep -Seconds $config.process_analyzer.check_interval_seconds
        }
    }
}

Invoke-ProcessAnalyzer -Analyze:$Analyze -Monitor:$Monitor -List:$List
