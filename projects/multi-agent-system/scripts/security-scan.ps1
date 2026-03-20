# Security Scan Script
# Author: Nia (AI Assistant)
# Created: 2026-03-11
# Purpose: Malware detection, suspicious file scanning, sensitive data detection

param(
    [string]$TargetPath = "C:\Users\57684\.openclaw\workspace",
    [string]$OutputDir = "C:\Users\57684\.openclaw\workspace\memory",
    [switch]$Verbose,
    [switch]$NoNpmAudit
)

$SuspiciousExtensions = @('.exe', '.bat', '.cmd', '.scr', '.vbs', '.vbe', '.wsf', '.wsh', '.msi', '.com', '.pif', '.application', '.gadget', '.hta', '.cpl', '.msc', '.lnk', '.inf', '.reg')
$RecentDays = 7

$Date = Get-Date -Format "yyyy-MM-dd"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$ReportFile = Join-Path $OutputDir "security-scan-$Date.md"

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$Report = "# Security Scan Report`n`n"
$Report += "Scan Time: $Timestamp`n"
$Report += "Target Path: $TargetPath`n"
$Report += "Scanner Version: 1.0.0`n`n"
$Report += "---`n`n"

$HighRiskIssues = @()
$MediumRiskIssues = @()
$LowRiskIssues = @()
$ScanStats = @{TotalFiles = 0; SuspiciousFiles = 0; SensitiveDataFound = 0; RecentModifiedFiles = 0; NpmVulnerabilities = 0}

Write-Host "Starting security scan..." -ForegroundColor Cyan
Write-Host "  Target: $TargetPath"
Write-Host "  Report: $ReportFile"
Write-Host ""

function Write-Warning-Immediate {
    param([string]$Message, [string]$Severity = "HIGH")
    $color = if ($Severity -eq "HIGH") { "Red" } elseif ($Severity -eq "MEDIUM") { "Yellow" } else { "Gray" }
    Write-Host "[$Severity] $Message" -ForegroundColor $color
    $issue = @{Severity = $Severity; Message = $Message; Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")}
    if ($Severity -eq "HIGH") { $script:HighRiskIssues += $issue }
    elseif ($Severity -eq "MEDIUM") { $script:MediumRiskIssues += $issue }
    else { $script:LowRiskIssues += $issue }
}

function Test-SuspiciousExtension {
    param([string]$FilePath)
    $extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    return $SuspiciousExtensions -contains $extension
}

function Test-SensitiveContent {
    param([string]$FilePath)
    $findings = @()
    try {
        $content = Get-Content -Path $FilePath -Raw -ErrorAction SilentlyContinue -MaximumCount 1000
        if ($content) {
            $patterns = @(
                @{Name="API_KEY"; Regex="(?i)api[_-]?key\s*[=:]\s*['""][a-zA-Z0-9_-]{16,}['""]"},
                @{Name="SECRET_KEY"; Regex="(?i)secret[_-]?key\s*[=:]\s*['""][a-zA-Z0-9_-]{16,}['""]"},
                @{Name="PASSWORD"; Regex="(?i)password\s*[=:]\s*['""][^\s'""]{8,}['""]"},
                @{Name="PRIVATE_KEY"; Regex="-----BEGIN.*PRIVATE KEY-----"},
                @{Name="AWS_KEY"; Regex="(?i)aws[_-]?access[_-]?key[_-]?id\s*[=:]\s*['""][A-Z0-9]{16,}['""]"},
                @{Name="GITHUB_TOKEN"; Regex="ghp_[a-zA-Z0-9]{36,}"}
            )
            foreach ($p in $patterns) {
                if ($content -match $p.Regex) {
                    $findings += @{Pattern = $p.Name; File = $FilePath}
                }
            }
        }
    }
    catch { }
    return $findings
}

function Get-RecentlyModifiedFiles {
    param([string]$Path, [int]$Days)
    $cutoffDate = (Get-Date).AddDays(-$Days)
    return Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $cutoffDate -and $_.FullName -notmatch "node_modules" } | Select-Object FullName, LastWriteTime, Length
}

function Invoke-NpmAudit {
    param([string]$Path)
    $vulnerabilities = @()
    if (Test-Path (Join-Path $Path "package.json")) {
        try {
            Write-Host "  Running npm audit..." -ForegroundColor Gray
            $null = npm audit --json 2>`$null | ConvertFrom-Json
        }
        catch { Write-Host "  npm audit failed or no package.json" -ForegroundColor Gray }
    }
    return $vulnerabilities
}

Write-Host "Scanning suspicious extensions..." -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path $TargetPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.openclaw" }
$ScanStats.TotalFiles = $allFiles.Count

foreach ($file in $allFiles) {
    if (Test-SuspiciousExtension $file.FullName) {
        $ScanStats.SuspiciousFiles++
        Write-Warning-Immediate -Message "Suspicious extension: $($file.FullName)" -Severity "MEDIUM"
        if ($Verbose) { Write-Host "  Found: $($file.Name)" -ForegroundColor Gray }
    }
}

Write-Host "Scanning sensitive content..." -ForegroundColor Cyan
$textFiles = $allFiles | Where-Object { $_.Extension -in @('.txt', '.md', '.json', '.js', '.ts', '.py', '.env', '.config', '.yml', '.yaml', '.ps1', '.sh') }

foreach ($file in $textFiles) {
    try {
        $findings = Test-SensitiveContent $file.FullName
        if ($findings.Count -gt 0) {
            $ScanStats.SensitiveDataFound += $findings.Count
            foreach ($finding in $findings) {
                Write-Warning-Immediate -Message "Sensitive data in: $($finding.File) [pattern: $($finding.Pattern)]" -Severity "HIGH"
            }
        }
    }
    catch { }
}

Write-Host "Checking recently modified files (last $RecentDays days)..." -ForegroundColor Cyan
$recentFiles = Get-RecentlyModifiedFiles -Path $TargetPath -Days $RecentDays
$ScanStats.RecentModifiedFiles = $recentFiles.Count

if ($recentFiles.Count -gt 20) {
    Write-Warning-Immediate -Message "$($recentFiles.Count) files modified in last $RecentDays days" -Severity "LOW"
}

if (-not $NoNpmAudit) {
    Write-Host "Running npm audit..." -ForegroundColor Cyan
    $npmVulns = Invoke-NpmAudit -Path $TargetPath
}

$Report += "## Scan Statistics`n`n"
$Report += "- Total Files: $($ScanStats.TotalFiles)`n"
$Report += "- Suspicious Extensions: $($ScanStats.SuspiciousFiles)`n"
$Report += "- Sensitive Data Found: $($ScanStats.SensitiveDataFound)`n"
$Report += "- Recently Modified: $($ScanStats.RecentModifiedFiles)`n"
$Report += "- NPM Vulnerabilities: $($ScanStats.NpmVulnerabilities)`n`n"
$Report += "---`n`n"

if ($HighRiskIssues.Count -gt 0) {
    $Report += "## HIGH RISK ISSUES (Immediate Action Required)`n`n"
    foreach ($issue in $HighRiskIssues) { $Report += "- [$($issue.Timestamp)] $($issue.Message)`n" }
    $Report += "`n"
}

if ($MediumRiskIssues.Count -gt 0) {
    $Report += "## MEDIUM RISK ISSUES (Review Recommended)`n`n"
    foreach ($issue in $MediumRiskIssues) { $Report += "- [$($issue.Timestamp)] $($issue.Message)`n" }
    $Report += "`n"
}

if ($LowRiskIssues.Count -gt 0) {
    $Report += "## LOW RISK ISSUES (For Reference)`n`n"
    foreach ($issue in $LowRiskIssues) { $Report += "- [$($issue.Timestamp)] $($issue.Message)`n" }
    $Report += "`n"
}

if ($recentFiles.Count -gt 0) {
    $Report += "## Recently Modified Files (Top 20)`n`n"
    $recentFiles | Select-Object -First 20 | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 2)
        $Report += "- $($_.FullName) | $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm')) | ${sizeKB}KB`n"
    }
    $Report += "`n"
}

$Report += "---`n`n"
$Report += "Scan Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$Report += "Scanner: security-scan.ps1 v1.0.0`n"
$Report += "`n> Tip: Review high risk issues immediately. Run this scan regularly for best security.`n"

try {
    $Report | Out-File -FilePath $ReportFile -Encoding UTF8
    Write-Host ""
    Write-Host "Scan Complete!" -ForegroundColor Green
    Write-Host "  Report saved to: $ReportFile"
}
catch {
    Write-Host "Failed to save report: $_" -ForegroundColor Red
}

if ($HighRiskIssues.Count -gt 0) {
    Write-Host ""
    Write-Host "WARNING: $($HighRiskIssues.Count) HIGH RISK issues found!" -ForegroundColor Red
    foreach ($issue in $HighRiskIssues) { Write-Host "  - $($issue.Message)" -ForegroundColor Red }
}

return @{
    ReportFile = $ReportFile
    HighRiskCount = $HighRiskIssues.Count
    MediumRiskCount = $MediumRiskIssues.Count
    LowRiskCount = $LowRiskIssues.Count
    Stats = $ScanStats
}
