<#
.SYNOPSIS
    文件监控模块 - 实时监控指定目录的可疑文件
.DESCRIPTION
    监控 Downloads, Desktop, Documents, workspace, projects 等目录
    检测新文件创建/修改，识别可疑扩展名，进行哈希比对
#>

param(
    [string]$ConfigPath = "$PSScriptRoot\env-monitor-config.json",
    [switch]$Watch,
    [switch]$Scan,
    [string]$TargetDir
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
    $logFile = Join-Path $LogPath "file-watcher-$(Get-Date -Format 'yyyyMMdd').log"
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

# 计算文件哈希
function Get-FileHash {
    param(
        [string]$FilePath,
        [string]$Algorithm = "SHA256"
    )
    try {
        $hash = Get-FileHash -Path $FilePath -Algorithm $Algorithm -ErrorAction Stop
        return $hash.Hash
    } catch {
        return $null
    }
}

# 加载恶意文件哈希数据库
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

# 检查可疑扩展名
function Test-SuspiciousExtension {
    param(
        [string]$FilePath,
        [string[]]$SuspiciousExtensions
    )
    $extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    return $SuspiciousExtensions -contains $extension
}

# 检查文件是否在恶意哈希数据库中
function Test-MalwareHash {
    param(
        [string]$FileHash,
        [hashtable]$MalwareDB
    )
    return $MalwareDB.ContainsKey($FileHash)
}

# 获取文件信息
function Get-FileInfo {
    param([string]$FilePath)
    try {
        $item = Get-Item $FilePath -ErrorAction Stop
        return @{
            Name = $item.Name
            FullName = $item.FullName
            Length = $item.Length
            CreationTime = $item.CreationTime
            LastWriteTime = $item.LastWriteTime
            Extension = $item.Extension
            Hash = (Get-FileHash -FilePath $FilePath)
        }
    } catch {
        return $null
    }
}

# 扫描单个目录
function Scan-Directory {
    param(
        [string]$Directory,
        [hashtable]$MalwareDB,
        [string[]]$SuspiciousExtensions,
        [string]$LogFile
    )
    
    if (!(Test-Path $Directory)) {
        Write-Log "目录不存在：$Directory" "WARNING" $LogFile
        return
    }
    
    Write-Log "开始扫描目录：$Directory" "INFO" $LogFile
    
    $files = Get-ChildItem -Path $Directory -File -Recurse -ErrorAction SilentlyContinue
    $suspiciousCount = 0
    
    foreach ($file in $files) {
        $fileInfo = Get-FileInfo -FilePath $file.FullName
        
        if ($fileInfo) {
            # 检查可疑扩展名
            if (Test-SuspiciousExtension -FilePath $file.FullName -SuspiciousExtensions $SuspiciousExtensions) {
                Write-Log "发现可疑文件：$($file.FullName) (扩展名：$($fileInfo.Extension))" "ALERT" $LogFile
                $suspiciousCount++
            }
            
            # 检查恶意哈希
            if ($fileInfo.Hash -and $MalwareDB.ContainsKey($fileInfo.Hash)) {
                Write-Log "发现恶意文件 (哈希匹配): $($file.FullName)" "ALERT" $LogFile
                Write-Log "  恶意软件标识：$($MalwareDB[$fileInfo.Hash])" "ALERT" $LogFile
                $suspiciousCount++
            }
        }
    }
    
    Write-Log "扫描完成：$Directory - 发现 $suspiciousCount 个可疑文件" "INFO" $LogFile
    return $suspiciousCount
}

# 实时监控
function Start-FileWatcher {
    param(
        [string[]]$Directories,
        [hashtable]$MalwareDB,
        [string[]]$SuspiciousExtensions,
        [string]$LogFile,
        [int]$Interval = 30
    )
    
    Write-Host "启动文件实时监控..." -ForegroundColor Cyan
    Write-Log "启动文件实时监控" "INFO" $LogFile
    
    # 创建文件系统监视器
    $watchers = @()
    
    foreach ($dir in $Directories) {
        if (Test-Path $dir) {
            $watcher = New-Object System.IO.FileSystemWatcher
            $watcher.Path = $dir
            $watcher.Filter = "*.*"
            $watcher.IncludeSubdirectories = $true
            $watcher.EnableRaisingEvents = $true
            
            $action = {
                $file = $Event.SourceEventArgs.FullPath
                $changeType = $Event.SourceEventArgs.ChangeType
                
                # 检查可疑文件
                if (Test-SuspiciousExtension -FilePath $file -SuspiciousExtensions $using:SuspiciousExtensions) {
                    Write-Log "实时检测 - $changeType : $file" "ALERT" $using:LogFile
                    
                    $hash = Get-FileHash -FilePath $file
                    if ($hash -and $using:MalwareDB.ContainsKey($hash)) {
                        Write-Log "实时检测 - 恶意文件确认：$file" "ALERT" $using:LogFile
                        Write-Host "⚠️  发现恶意文件：$file" -ForegroundColor Red
                    }
                }
            }
            
            Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
            Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
            
            $watchers += $watcher
            Write-Log "监控目录：$dir" "INFO" $LogFile
        } else {
            Write-Log "目录不存在，跳过：$dir" "WARNING" $LogFile
        }
    }
    
    Write-Host "按 Ctrl+C 停止监控" -ForegroundColor Yellow
    
    # 保持运行
    while ($true) {
        Start-Sleep -Seconds $Interval
    }
    
    # 清理事件
    foreach ($watcher in $watchers) {
        $watcher.EnableRaisingEvents = $false
        $watcher.Dispose()
    }
}

# 主函数
function Invoke-FileWatcher {
    param(
        [switch]$Watch,
        [switch]$Scan,
        [string]$TargetDir
    )
    
    $config = Get-Config -Path $ConfigPath
    $logFile = Initialize-Log -LogPath $config.monitoring.log_path
    
    # 加载恶意哈希数据库
    $malwareDbPath = Join-Path $PSScriptRoot $config.file_watcher.malware_hash_db
    $malwareDB = Get-MalwareHashDB -DbPath $malwareDbPath
    
    $suspiciousExtensions = $config.file_watcher.suspicious_extensions
    $directories = $config.file_watcher.directories
    
    if ($Watch) {
        # 实时监控模式
        Start-FileWatcher `
            -Directories $directories `
            -MalwareDB $malwareDB `
            -SuspiciousExtensions $suspiciousExtensions `
            -LogFile $logFile `
            -Interval $config.monitoring.interval_seconds
    }
    elseif ($Scan -or !$Watch) {
        # 扫描模式
        if ($TargetDir) {
            $directories = @($TargetDir)
        }
        
        $totalSuspicious = 0
        foreach ($dir in $directories) {
            $count = Scan-Directory `
                -Directory $dir `
                -MalwareDB $malwareDB `
                -SuspiciousExtensions $suspiciousExtensions `
                -LogFile $logFile
            $totalSuspicious += $count
        }
        
        Write-Host "`n扫描完成 - 共发现 $totalSuspicious 个可疑文件" -ForegroundColor $(if ($totalSuspicious -gt 0) { "Red" } else { "Green" })
        Write-Log "扫描完成 - 共发现 $totalSuspicious 个可疑文件" "INFO" $logFile
    }
}

# 执行
Invoke-FileWatcher -Watch:$Watch -Scan:$Scan -TargetDir $TargetDir
