# Local Environment Security Monitoring System - Main Script
# Author: Nia (AI Assistant)
# Version: 1.0.0
# Date: 2026-03-11

param(
    [string]$ConfigPath = "$PSScriptRoot\env-monitor-config.json",
    [ValidateSet("dashboard", "scan", "watch", "analyze", "network", "system", "report", "help")]
    [string]$Mode = "dashboard",
    [switch]$Quiet,
    [string]$OutputPath
)

$Colors = @{
    Primary = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "White"
}

function Show-Banner {
    Clear-Host
    Write-Host @"
===============================================================

     [SECURITY] Local Environment Monitor (EnvMonitor)

     Protect your entire local environment

===============================================================
"@ -ForegroundColor $Colors.Primary
}

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
    $logFile = Join-Path $LogPath "env-monitor-$(Get-Date -Format 'yyyyMMdd').log"
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
    
    if (!$Quiet) {
        if ($Level -eq "ALERT") {
            Write-Host $logEntry -ForegroundColor Red
        } elseif ($Level -eq "WARNING") {
            Write-Host $logEntry -ForegroundColor Yellow
        }
    }
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

function Show-MainMenu {
    Write-Host @"

Select Operation:

  1) Security Dashboard
  2) Full System Scan
  3) Real-time Monitor
  4) File Watcher
  5) Process Analyzer
  6) Network Monitor
  7) System Checker
  8) Generate Report
  9) Help
  0) Exit

"@ -ForegroundColor $Colors.Info
    
    $choice = Read-Host "Enter choice (0-9)"
    return $choice
}

function Show-Dashboard {
    param(
        [object]$Config,
        [string]$LogFile
    )
    
    Show-Banner
    
    Write-Host "`n===============================================================" -ForegroundColor $Colors.Primary
    Write-Host "                    SECURITY DASHBOARD" -ForegroundColor $Colors.Primary
    Write-Host "===============================================================`n" -ForegroundColor $Colors.Primary
    
    $status = @{
        LastScan = "Unknown"
        ThreatsDetected = 0
    }
    
    if (Test-Path $LogFile) {
        $lastLog = Get-Content $LogFile | Select-Object -Last 50
        $alerts = $lastLog | Where-Object { $_ -match "\[ALERT\]" }
        $status.ThreatsDetected = $alerts.Count
        
        $lastScan = $lastLog | Where-Object { $_ -match "Scan complete" } | Select-Object -Last 1
        if ($lastScan) {
            $match = $lastScan -match "\[(.*?)\]"
            if ($match) {
                $status.LastScan = $matches[1]
            }
        }
    }
    
    Write-Host "[MONITORING STATUS]" -ForegroundColor $Colors.Primary
    $fwStatus = if ($Config.file_watcher.enabled) { "[ON]" } else { "[OFF]" }
    $paStatus = if ($Config.process_analyzer.enabled) { "[ON]" } else { "[OFF]" }
    $nmStatus = if ($Config.network_monitor.enabled) { "[ON]" } else { "[OFF]" }
    $scStatus = if ($Config.system_checker.enabled) { "[ON]" } else { "[OFF]" }
    Write-Host "  File Watcher:      $fwStatus" -ForegroundColor $(if ($Config.file_watcher.enabled) { $Colors.Success } else { $Colors.Warning })
    Write-Host "  Process Analyzer:  $paStatus" -ForegroundColor $(if ($Config.process_analyzer.enabled) { $Colors.Success } else { $Colors.Warning })
    Write-Host "  Network Monitor:   $nmStatus" -ForegroundColor $(if ($Config.network_monitor.enabled) { $Colors.Success } else { $Colors.Warning })
    Write-Host "  System Checker:    $scStatus" -ForegroundColor $(if ($Config.system_checker.enabled) { $Colors.Success } else { $Colors.Warning })
    
    Write-Host "`n[SCAN INFO]" -ForegroundColor $Colors.Primary
    Write-Host "  Last Scan:     $($status.LastScan)" -ForegroundColor $Colors.Info
    Write-Host "  Threats:       $($status.ThreatsDetected)" -ForegroundColor $(if ($status.ThreatsDetected -gt 0) { $Colors.Error } else { $Colors.Success })
    
    Write-Host "`n[MONITORED DIRECTORIES]" -ForegroundColor $Colors.Primary
    foreach ($dir in $Config.file_watcher.directories) {
        $exists = Test-Path $dir
        $icon = if ($exists) { "[+]" } else { "[-]" }
        Write-Host "  $icon $dir" -ForegroundColor $(if ($exists) { $Colors.Success } else { $Colors.Warning })
    }
    
    Write-Host "`n[SUSPICIOUS EXTENSIONS]" -ForegroundColor $Colors.Primary
    Write-Host "  $($Config.file_watcher.suspicious_extensions -join ', ')" -ForegroundColor $Colors.Info
    
    Write-Host "`n===============================================================`n" -ForegroundColor $Colors.Primary
}

function Start-FullScan {
    param(
        [object]$Config,
        [hashtable]$MalwareDB,
        [string]$LogFile
    )
    
    Show-Banner
    
    Write-Host "`nStarting full system scan..." -ForegroundColor $Colors.Primary
    Write-Log "Starting full system scan" "INFO" $LogFile
    
    $totalFiles = 0
    $suspiciousFiles = 0
    $startTime = Get-Date
    
    foreach ($dir in $Config.file_watcher.directories) {
        if (Test-Path $dir) {
            Write-Host "  Scanning: $dir" -ForegroundColor $Colors.Info
            
            $files = Get-ChildItem -Path $dir -File -Recurse -ErrorAction SilentlyContinue
            $totalFiles += $files.Count
            
            foreach ($file in $files) {
                $ext = [System.IO.Path]::GetExtension($file.Name).ToLower()
                if ($Config.file_watcher.suspicious_extensions -contains $ext) {
                    $suspiciousFiles++
                    Write-Host "    [!] Suspicious: $($file.FullName)" -ForegroundColor $Colors.Warning
                    Write-Log "Suspicious file: $($file.FullName) (ext: $ext)" "WARNING" $LogFile
                }
                
                try {
                    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
                    if ($hash -and $MalwareDB.ContainsKey($hash)) {
                        Write-Host "    [!!!] MALWARE: $($file.FullName)" -ForegroundColor $Colors.Error
                        Write-Host "          Signature: $($MalwareDB[$hash])" -ForegroundColor $Colors.Error
                        Write-Log "MALWARE: $($file.FullName) - $($MalwareDB[$hash])" "ALERT" $LogFile
                        $suspiciousFiles++
                    }
                } catch {
                    # Cannot compute hash
                }
            }
        } else {
            Write-Host "  Skip (not found): $dir" -ForegroundColor $Colors.Warning
        }
    }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n===============================================================" -ForegroundColor $Colors.Primary
    Write-Host "SCAN COMPLETE!" -ForegroundColor $Colors.Success
    Write-Host "  Files scanned:   $totalFiles" -ForegroundColor $Colors.Info
    Write-Host "  Suspicious:      $suspiciousFiles" -ForegroundColor $(if ($suspiciousFiles -gt 0) { $Colors.Error } else { $Colors.Success })
    Write-Host "  Duration:        $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor $Colors.Info
    Write-Host "===============================================================`n" -ForegroundColor $Colors.Primary
    
    Write-Log "Scan complete - Files: $totalFiles, Suspicious: $suspiciousFiles, Duration: $($duration.TotalSeconds)s" "INFO" $LogFile
}

function Generate-Report {
    param(
        [object]$Config,
        [string]$LogFile,
        [string]$OutputPath
    )
    
    if (!$OutputPath) {
        $OutputPath = Join-Path $PSScriptRoot "..\reports"
        if (!(Test-Path $OutputPath)) {
            New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
        }
    }
    
    $reportFile = Join-Path $OutputPath "security-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    Write-Host "`nGenerating security report..." -ForegroundColor $Colors.Primary
    
    $reportContent = "# Local Environment Security Report`n"
    $reportContent += "`n**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n"
    $reportContent += "**Config:** $ConfigPath`n"
    $reportContent += "`n---`n"
    $reportContent += "`n## Configuration Summary`n"
    $reportContent += "`n### File Watcher`n"
    $reportContent += "- Status: $(if ($Config.file_watcher.enabled) { "ENABLED" } else { "DISABLED" })`n"
    $reportContent += "- Directories: $($Config.file_watcher.directories.Count)`n"
    $reportContent += "- Suspicious Extensions: $($Config.file_watcher.suspicious_extensions.Count)`n"
    $reportContent += "`n### Process Analyzer`n"
    $reportContent += "- Status: $(if ($Config.process_analyzer.enabled) { "ENABLED" } else { "DISABLED" })`n"
    $reportContent += "- CPU Threshold: $($Config.process_analyzer.cpu_threshold_percent)%`n"
    $reportContent += "- Memory Threshold: $($Config.process_analyzer.memory_threshold_percent)%`n"
    $reportContent += "`n### Network Monitor`n"
    $reportContent += "- Status: $(if ($Config.network_monitor.enabled) { "ENABLED" } else { "DISABLED" })`n"
    $reportContent += "- Blocked Ports: $($Config.network_monitor.blocked_ports -join ', ')`n"
    $reportContent += "`n### System Checker`n"
    $reportContent += "- Status: $(if ($Config.system_checker.enabled) { "ENABLED" } else { "DISABLED" })`n"
    $reportContent += "- Check Interval: $($Config.system_checker.check_interval_minutes) minutes`n"
    $reportContent += "`n---`n"
    $reportContent += "`n## Scan Results`n"
    
    foreach ($dir in $Config.file_watcher.directories) {
        if (Test-Path $dir) {
            $fileCount = (Get-ChildItem -Path $dir -File -Recurse -ErrorAction SilentlyContinue).Count
            $reportContent += "`n- **$dir`**: $fileCount files"
        } else {
            $reportContent += "`n- **$dir`**: (not found)"
        }
    }
    
    $reportContent += "`n---`n"
    $reportContent += "`n## Recommendations`n"
    $reportContent += "`n1. Run full scan regularly (weekly recommended)`n"
    $reportContent += "2. Keep monitoring system active`n"
    $reportContent += "3. Review alerts and warnings promptly`n"
    $reportContent += "4. Update malware hash database periodically`n"
    $reportContent += "`n---`n"
    $reportContent += "`n*Report generated by EnvMonitor*`n"
    
    Set-Content -Path $reportFile -Value $reportContent -Encoding UTF8
    
    Write-Host "Report generated: $reportFile" -ForegroundColor $Colors.Success
    Write-Log "Report generated: $reportFile" "INFO" $LogFile
}

function Show-Help {
    Show-Banner
    
    Write-Host @"

USAGE HELP

Command Line:
  .\env-monitor.ps1 -Mode <mode>

Available Modes:
  dashboard  - Show security dashboard
  scan       - Run full system scan
  watch      - Start real-time file monitoring
  analyze    - Analyze current processes
  network    - Check network connections
  system     - Check system configuration
  report     - Generate security report
  help       - Show this help

Parameters:
  -Quiet     - Quiet mode (reduced output)
  -OutputPath <path> - Report output path

Interactive Mode:
  Run .\env-monitor.ps1 without parameters

Config File:
  env-monitor-config.json

Log Location:
  logs\env-monitor-YYYYMMDD.log

Modules:
  file-watcher.ps1    - File monitoring
  process-analyzer.ps1 - Process analysis
  network-monitor.ps1  - Network monitoring
  system-checker.ps1   - System configuration

===============================================================
"@ -ForegroundColor $Colors.Info
}

function Invoke-EnvMonitor {
    param(
        [string]$Mode,
        [switch]$Quiet,
        [string]$OutputPath
    )
    
    try {
        $config = Get-Config -Path $ConfigPath
        $logFile = Initialize-Log -LogPath $config.monitoring.log_path
        
        $malwareDbPath = Join-Path $PSScriptRoot $config.file_watcher.malware_hash_db
        $malwareDB = Get-MalwareHashDB -DbPath $malwareDbPath
        
        if (!(Test-Path $malwareDbPath)) {
            $sampleDB = "# Malware Hash Database (SHA256)`n# Format: hash,malware_name`n"
            Set-Content -Path $malwareDbPath -Value $sampleDB -Encoding UTF8
            Write-Host "Created sample malware hash DB: $malwareDbPath" -ForegroundColor $Colors.Info
        }
        
        if ($Mode -eq "help") {
            Show-Help
            return
        }
        
        if ($Mode -eq "dashboard") {
            Show-Dashboard -Config $config -LogFile $logFile
            
            while ($true) {
                $choice = Show-MainMenu
                
                switch ($choice) {
                    "1" { Show-Dashboard -Config $config -LogFile $logFile }
                    "2" { Start-FullScan -Config $config -MalwareDB $malwareDB -LogFile $logFile }
                    "3" { 
                        Write-Host "Starting real-time monitor..." -ForegroundColor $Colors.Primary
                        & "$PSScriptRoot\file-watcher.ps1" -Watch
                    }
                    "4" { & "$PSScriptRoot\file-watcher.ps1" -Analyze }
                    "5" { & "$PSScriptRoot\process-analyzer.ps1" -Analyze }
                    "6" { & "$PSScriptRoot\network-monitor.ps1" -Scan }
                    "7" { & "$PSScriptRoot\system-checker.ps1" -Check }
                    "8" { Generate-Report -Config $config -LogFile $logFile -OutputPath $OutputPath }
                    "9" { Show-Help }
                    "0" { 
                        Write-Host "Exiting..." -ForegroundColor $Colors.Info
                        return
                    }
                    default { Write-Host "Invalid option" -ForegroundColor $Colors.Warning }
                }
            }
        }
        elseif ($Mode -eq "scan") {
            Start-FullScan -Config $config -MalwareDB $malwareDB -LogFile $logFile
        }
        elseif ($Mode -eq "watch") {
            & "$PSScriptRoot\file-watcher.ps1" -Watch
        }
        elseif ($Mode -eq "analyze") {
            & "$PSScriptRoot\process-analyzer.ps1" -Analyze
        }
        elseif ($Mode -eq "network") {
            & "$PSScriptRoot\network-monitor.ps1" -Scan
        }
        elseif ($Mode -eq "system") {
            & "$PSScriptRoot\system-checker.ps1" -Check
        }
        elseif ($Mode -eq "report") {
            Generate-Report -Config $config -LogFile $logFile -OutputPath $OutputPath
        }
        else {
            Show-Help
        }
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor $Colors.Error
        Write-Log "Error: $($_.Exception.Message)" "ERROR" $LogFile
    }
}

Invoke-EnvMonitor -Mode $Mode -Quiet:$Quiet -OutputPath $OutputPath
