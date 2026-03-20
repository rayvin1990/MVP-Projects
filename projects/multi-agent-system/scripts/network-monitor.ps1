<#
.SYNOPSIS
    网络监控模块 - 检测可疑网络连接
.DESCRIPTION
    监控所有外连请求，检测可疑 IP/端口连接
    识别异常流量模式，阻止恶意域名访问
#>

param(
    [string]$ConfigPath = "$PSScriptRoot\env-monitor-config.json",
    [switch]$Monitor,
    [switch]$Scan,
    [switch]$Block
)

# 加载配置文件
function Get-Config {
    param([string]$Path)
    if (Test-Path $Path) {
        return Get-Content $Path | ConvertFrom-Json
    }
    throw "配置文件不存在：$Path"
}

# 初始化日志
function Initialize-Log {
    param([string]$LogPath)
    if (!(Test-Path $LogPath)) {
        New-Item -ItemType Directory -Force -Path $LogPath | Out-Null
    }
    $logFile = Join-Path $LogPath "network-monitor-$(Get-Date -Format 'yyyyMMdd').log"
    return $logFile
}

# 写日志
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

# 获取所有网络连接
function Get-AllConnections {
    try {
        $connections = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object {
            $_.State -eq 'Established' -or $_.State -eq 'Connect'
        }
        
        return $connections | ForEach-Object {
            try {
                $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                
                [PSCustomObject]@{
                    LocalAddress = $_.LocalAddress
                    LocalPort = $_.LocalPort
                    RemoteAddress = $_.RemoteAddress
                    RemotePort = $_.RemotePort
                    State = $_.State
                    ProcessName = if ($process) { $process.Name } else { "Unknown" }
                    ProcessId = $_.OwningProcess
                    ProcessPath = if ($process -and $process.Path) { $process.Path } else { "N/A" }
                    Direction = if ($_.RemoteAddress -as [System.Net.IPAddress]) { "Outbound" } else { "Unknown" }
                }
            } catch {
                [PSCustomObject]@{
                    LocalAddress = $_.LocalAddress
                    LocalPort = $_.LocalPort
                    RemoteAddress = $_.RemoteAddress
                    RemotePort = $_.RemotePort
                    State = $_.State
                    ProcessName = "Unknown"
                    ProcessId = $_.OwningProcess
                    ProcessPath = "N/A"
                    Direction = "Unknown"
                }
            }
        }
    } catch {
        Write-Host "无法获取网络连接信息，可能需要管理员权限" -ForegroundColor Red
        return @()
    }
}

# 获取 DNS 缓存
function Get-DNSCache {
    try {
        return Get-DnsClientCache -ErrorAction SilentlyContinue | Select-Object Entry, Name, Status
    } catch {
        return @()
    }
}

# 检查可疑端口
function Test-SuspiciousPort {
    param(
        [int]$Port,
        [int[]]$BlockedPorts,
        [int[]]$SuspiciousPorts
    )
    
    if ($BlockedPorts -contains $Port) {
        return @{ IsSuspicious = $true; Reason = "被阻止的端口" }
    }
    
    if ($SuspiciousPorts -contains $Port) {
        return @{ IsSuspicious = $true; Reason = "可疑端口" }
    }
    
    # 常见恶意软件端口
    $knownBadPorts = @(4444, 5555, 6666, 7777, 8888, 9999, 1337, 31337, 12345, 54321)
    if ($knownBadPorts -contains $Port) {
        return @{ IsSuspicious = $true; Reason = "已知恶意端口" }
    }
    
    return @{ IsSuspicious = $false; Reason = "" }
}

# 检查可疑 IP
function Test-SuspiciousIP {
    param(
        [string]$IPAddress
    )
    
    if (!$IPAddress -or $IPAddress -eq "0.0.0.0" -or $IPAddress -eq "127.0.0.1") {
        return @{ IsSuspicious = $false; Reason = "" }
    }
    
    # 检查私有地址
    try {
        $ip = [System.Net.IPAddress]::Parse($IPAddress)
        $bytes = $ip.GetAddressBytes()
        
        # 私有地址范围
        if ($bytes[0] -eq 10 -or 
            ($bytes[0] -eq 172 -and $bytes[1] -ge 16 -and $bytes[1] -le 31) -or 
            ($bytes[0] -eq 192 -and $bytes[1] -eq 168)) {
            return @{ IsSuspicious = $false; Reason = "私有地址" }
        }
        
        # 检查常见云服务商（通常可信）
        # 这里可以添加更多检查
    } catch {
        return @{ IsSuspicious = $true; Reason = "无效 IP 地址" }
    }
    
    return @{ IsSuspicious = $false; Reason = "" }
}

# 分析连接
function Analyze-Connections {
    param(
        [object[]]$Connections,
        [int[]]$BlockedPorts,
        [int[]]$SuspiciousPorts,
        [string[]]$BlockedDomains,
        [string]$LogFile
    )
    
    $results = @{
        Total = $Connections.Count
        Suspicious = @()
        ByPort = @{}
        ByProcess = @{}
    }
    
    foreach ($conn in $Connections) {
        $issues = @()
        
        # 检查端口
        $portCheck = Test-SuspiciousPort -Port $conn.RemotePort -BlockedPorts $BlockedPorts -SuspiciousPorts $SuspiciousPorts
        if ($portCheck.IsSuspicious) {
            $issues += $portCheck.Reason
        }
        
        # 检查 IP
        $ipCheck = Test-SuspiciousIP -IPAddress $conn.RemoteAddress
        if ($ipCheck.IsSuspicious) {
            $issues += $ipCheck.Reason
        }
        
        # 未知进程
        if ($conn.ProcessName -eq "Unknown") {
            $issues += "未知进程"
        }
        
        if ($issues.Count -gt 0) {
            $results.Suspicious += [PSCustomObject]@{
                Connection = $conn
                Issues = $issues
            }
            
            Write-Log "可疑连接：$($conn.ProcessName) -> $($conn.RemoteAddress):$($conn.RemotePort) - $($issues -join ', ')" "ALERT" $LogFile
        }
        
        # 统计
        if (!$results.ByPort.ContainsKey($conn.RemotePort)) {
            $results.ByPort[$conn.RemotePort] = 0
        }
        $results.ByPort[$conn.RemotePort]++
        
        if (!$results.ByProcess.ContainsKey($conn.ProcessName)) {
            $results.ByProcess[$conn.ProcessName] = 0
        }
        $results.ByProcess[$conn.ProcessName]++
    }
    
    return $results
}

# 显示连接列表
function Show-Connections {
    param([object[]]$Connections)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "         网络连接列表" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    if ($Connections.Count -eq 0) {
        Write-Host "  无活动连接" -ForegroundColor Yellow
        return
    }
    
    $table = $Connections | Select-Object ProcessName, 
        @{N='Remote';E={"$($_.RemoteAddress):$($_.RemotePort)"}},
        State, 
        @{N='Local';E={"$($_.LocalAddress):$($_.LocalPort)"}} | 
        Sort-Object ProcessName
    
    $table | Format-Table -AutoSize
    
    Write-Host "`n总计：$($Connections.Count) 个连接" -ForegroundColor Green
}

# 显示分析报告
function Show-AnalysisReport {
    param([object]$Analysis)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "         网络安全分析报告" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # 可疑连接
    Write-Host "【可疑连接】" -ForegroundColor $(if ($Analysis.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    if ($Analysis.Suspicious.Count -gt 0) {
        foreach ($s in $Analysis.Suspicious) {
            Write-Host "  $($s.Connection.ProcessName) (PID: $($s.Connection.ProcessId))" -ForegroundColor Red
            Write-Host "    目标：$($s.Connection.RemoteAddress):$($s.Connection.RemotePort)" -ForegroundColor Yellow
            Write-Host "    问题：$($s.Issues -join ', ')" -ForegroundColor Red
        }
    } else {
        Write-Host "  无异常" -ForegroundColor Green
    }
    
    # 按端口统计
    Write-Host "`n【按端口统计】" -ForegroundColor Yellow
    $topPorts = $Analysis.ByPort.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10
    foreach ($port in $topPorts) {
        Write-Host "  端口 $($port.Key): $($port.Value) 个连接" -ForegroundColor White
    }
    
    # 按进程统计
    Write-Host "`n【按进程统计】" -ForegroundColor Yellow
    $topProcesses = $Analysis.ByProcess.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10
    foreach ($proc in $topProcesses) {
        Write-Host "  $($proc.Key): $($proc.Value) 个连接" -ForegroundColor White
    }
    
    # 总结
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "统计信息:" -ForegroundColor White
    Write-Host "  总连接数：$($Analysis.Total)" -ForegroundColor White
    Write-Host "  可疑连接：$($Analysis.Suspicious.Count)" -ForegroundColor $(if ($Analysis.Suspicious.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "========================================`n" -ForegroundColor Cyan
}

# 实时监控
function Start-NetworkMonitor {
    param(
        [int[]]$BlockedPorts,
        [int[]]$SuspiciousPorts,
        [string[]]$BlockedDomains,
        [int]$Interval,
        [string]$LogFile
    )
    
    Write-Host "启动网络实时监控..." -ForegroundColor Cyan
    Write-Log "启动网络实时监控" "INFO" $LogFile
    
    $lastAlert = @{}
    $connectionHistory = @{}
    
    while ($true) {
        $connections = Get-AllConnections
        
        foreach ($conn in $connections) {
            $key = "$($conn.RemoteAddress):$($conn.RemotePort)_$($conn.ProcessId)"
            
            # 检查新连接
            if (!$connectionHistory.ContainsKey($key)) {
                $connectionHistory[$key] = Get-Date
                Write-Log "新连接：$($conn.ProcessName) -> $($conn.RemoteAddress):$($conn.RemotePort)" "INFO" $LogFile
            }
            
            # 检查可疑连接
            $portCheck = Test-SuspiciousPort -Port $conn.RemotePort -BlockedPorts $BlockedPorts -SuspiciousPorts $SuspiciousPorts
            if ($portCheck.IsSuspicious) {
                $alertKey = "alert_$key"
                $now = Get-Date
                
                if (!$lastAlert.ContainsKey($alertKey) -or ($now - $lastAlert[$alertKey]).TotalMinutes -gt 5) {
                    Write-Log "实时监控 - 可疑端口连接：$($conn.ProcessName) -> $($conn.RemoteAddress):$($conn.RemotePort) - $($portCheck.Reason)" "ALERT" $LogFile
                    Write-Host "⚠️  可疑连接：$($conn.ProcessName) -> $($conn.RemoteAddress):$($conn.RemotePort) ($($portCheck.Reason))" -ForegroundColor Red
                    $lastAlert[$alertKey] = $now
                }
            }
        }
        
        # 清理旧连接记录
        $now = Get-Date
        $connectionHistory.GetEnumerator() | Where-Object {
            ($now - $_.Value).TotalMinutes -gt 30
        } | ForEach-Object {
            $connectionHistory.Remove($_.Key)
        }
        
        Start-Sleep -Seconds $Interval
    }
}

# 阻止恶意连接（需要管理员权限）
function Block-MaliciousConnections {
    param(
        [string[]]$BlockedDomains,
        [int[]]$BlockedPorts
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "         阻止恶意连接" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # 检查管理员权限
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if (!$isAdmin) {
        Write-Host "需要管理员权限才能阻止连接" -ForegroundColor Red
        Write-Host "请以管理员身份运行 PowerShell" -ForegroundColor Yellow
        return
    }
    
    # 添加防火墙规则阻止端口
    foreach ($port in $BlockedPorts) {
        $ruleName = "EnvMonitor_Block_Port_$port"
        
        try {
            $existing = Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue
            if (!$existing) {
                New-NetFirewallRule -DisplayName $ruleName -Direction Outbound -LocalPort $port -Protocol TCP -Action Block -ErrorAction Stop
                Write-Host "✓ 已阻止端口：$port" -ForegroundColor Green
            } else {
                Write-Host "  端口 $port 已被阻止" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✗ 无法阻止端口 $port : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # 添加 DNS 阻止（通过 hosts 文件）
    $hostsPath = "C:\Windows\System32\drivers\etc\hosts"
    $hostsBackup = "$hostsPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    try {
        Copy-Item $hostsPath $hostsBackup -Force
        Write-Host "✓ 已创建 hosts 备份：$hostsBackup" -ForegroundColor Green
        
        $hostsContent = Get-Content $hostsPath
        
        foreach ($domain in $BlockedDomains) {
            if ($hostsContent -notmatch "0\.0\.0\.0\s+$domain") {
                Add-Content $hostsPath "0.0.0.0 $domain"
                Write-Host "✓ 已阻止域名：$domain" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "✗ 无法修改 hosts 文件：$($_.Exception.Message)" -ForegroundColor Red
    }
}

# 主函数
function Invoke-NetworkMonitor {
    param(
        [switch]$Monitor,
        [switch]$Scan,
        [switch]$Block
    )
    
    $config = Get-Config -Path $ConfigPath
    $logFile = Initialize-Log -LogPath $config.monitoring.log_path
    
    Write-Host "获取网络连接信息..." -ForegroundColor Cyan
    $connections = Get-AllConnections
    
    if ($Scan -or (!$Monitor -and !$Block)) {
        $analysis = Analyze-Connections `
            -Connections $connections `
            -BlockedPorts $config.network_monitor.blocked_ports `
            -SuspiciousPorts $config.network_monitor.suspicious_ports `
            -BlockedDomains $config.network_monitor.blocked_domains `
            -LogFile $logFile
        
        Show-Connections -Connections $connections
        Show-AnalysisReport -Analysis $analysis
    }
    
    if ($Monitor) {
        Start-NetworkMonitor `
            -BlockedPorts $config.network_monitor.blocked_ports `
            -SuspiciousPorts $config.network_monitor.suspicious_ports `
            -BlockedDomains $config.network_monitor.blocked_domains `
            -Interval $config.network_monitor.check_interval_seconds `
            -LogFile $logFile
    }
    
    if ($Block) {
        Block-MaliciousConnections `
            -BlockedDomains $config.network_monitor.blocked_domains `
            -BlockedPorts $config.network_monitor.blocked_ports
    }
}

# 执行
Invoke-NetworkMonitor -Monitor:$Monitor -Scan:$Scan -Block:$Block
