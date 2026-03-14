# Warning Templates - 风险警告模板库
# Author: Nia (AI Assistant)
# Created: 2026-03-11
# Purpose: 提供标准化的风险警告输出格式（高危/中危/低危）

# ============================================================================
# 风险等级定义
# ============================================================================
# HIGH (高危):   需要立即处理，可能导致数据泄露、系统被控、恶意软件执行
# MEDIUM (中危): 需要尽快审查，可能存在安全隐患或配置问题
# LOW (低危):    建议关注，信息性警告或最佳实践建议

# ============================================================================
# 警告输出格式
# ============================================================================

function Get-Warning-Template {
    param(
        [string]$Severity,
        [string]$IssueType,
        [string]$Details,
        [string]$FilePath = "",
        [string]$Timestamp = $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    )
    
    $templates = @{
        HIGH = @{
            Icon = "🔴"
            Color = "Red"
            Prefix = "[CRITICAL]"
            Urgency = "IMMEDIATE ACTION REQUIRED"
        }
        MEDIUM = @{
            Icon = "🟡"
            Color = "Yellow"
            Prefix = "[WARNING]"
            Urgency = "Review Recommended"
        }
        LOW = @{
            Icon = "🔵"
            Color = "Gray"
            Prefix = "[INFO]"
            Urgency = "For Reference"
        }
    }
    
    $template = $templates[$Severity]
    if (!$template) {
        $template = $templates["LOW"]
    }
    
    return @{
        Formatted = Format-Warning-Message -Severity $Severity -IssueType $IssueType -Details $Details -FilePath $FilePath -Template $template -Timestamp $Timestamp
        Raw = @{
            Severity = $Severity
            IssueType = $IssueType
            Details = $Details
            FilePath = $FilePath
            Timestamp = $Timestamp
            Urgency = $template.Urgency
        }
    }
}

function Format-Warning-Message {
    param(
        [string]$Severity,
        [string]$IssueType,
        [string]$Details,
        [string]$FilePath,
        [hashtable]$Template,
        [string]$Timestamp
    )
    
    $message = @"
$($Template.Icon) $($Template.Prefix) - $IssueType
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Severity:  $Severity
Urgency:   $($Template.Urgency)
Time:      $Timestamp
"@
    
    if ($FilePath) {
        $message += "`nFile:      $FilePath"
    }
    
    $message += "`n`nIssue:     $Details"
    $message += "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    return $message
}

function Write-Security-Warning {
    param(
        [string]$Severity = "MEDIUM",
        [string]$IssueType = "Security Issue",
        [string]$Details = "",
        [string]$FilePath = "",
        [switch]$NoColor
    )
    
    $warning = Get-Warning-Template -Severity $Severity -IssueType $IssueType -Details $Details -FilePath $FilePath
    
    $color = if ($NoColor) { "White" } else {
        switch ($Severity) {
            "HIGH" { "Red" }
            "MEDIUM" { "Yellow" }
            "LOW" { "Gray" }
            default { "White" }
        }
    }
    
    Write-Host $warning.Formatted -ForegroundColor $color
    return $warning.Raw
}

# ============================================================================
# 预设警告类型
# ============================================================================

function New-Malware-Warning {
    param([string]$FilePath, [string]$MalwareType = "Unknown malware")
    return Get-Warning-Template -Severity "HIGH" -IssueType "Malware Detected" -Details "$MalwareType detected in file" -FilePath $FilePath
}

function New-SensitiveData-Warning {
    param([string]$FilePath, [string]$DataType = "Credentials")
    return Get-Warning-Template -Severity "HIGH" -IssueType "Sensitive Data Exposure" -Details "$DataType found in file - potential credential leak" -FilePath $FilePath
}

function New-SuspiciousExtension-Warning {
    param([string]$FilePath, [string]$Extension = "")
    return Get-Warning-Template -Severity "MEDIUM" -IssueType "Suspicious File Extension" -Details "File has potentially dangerous extension: $Extension" -FilePath $FilePath
}

function New-UnauthorizedChange-Warning {
    param([string]$FilePath, [string]$ChangeType = "File modified")
    return Get-Warning-Template -Severity "MEDIUM" -IssueType "Unauthorized Change Detected" -Details "$ChangeType - review recommended" -FilePath $FilePath
}

function New-ConfigIssue-Warning {
    param([string]$FilePath, [string]$ConfigIssue = "Insecure configuration")
    return Get-Warning-Template -Severity "LOW" -IssueType "Configuration Issue" -Details "$ConfigIssue" -FilePath $FilePath
}

function New-NetworkAnomaly-Warning {
    param([string]$Details = "Unusual network activity detected")
    return Get-Warning-Template -Severity "HIGH" -IssueType "Network Anomaly" -Details $Details -FilePath ""
}

function New-PermissionIssue-Warning {
    param([string]$FilePath, [string]$PermissionIssue = "Overly permissive access")
    return Get-Warning-Template -Severity "MEDIUM" -IssueType "Permission Issue" -Details "$PermissionIssue" -FilePath $FilePath
}

# ============================================================================
# Markdown 报告格式
# ============================================================================

function ConvertTo-MarkdownWarning {
    param(
        [array]$Warnings,
        [string]$ReportTitle = "Security Warning Report"
    )
    
    $highWarnings = $Warnings | Where-Object { $_.Severity -eq "HIGH" }
    $mediumWarnings = $Warnings | Where-Object { $_.Severity -eq "MEDIUM" }
    $lowWarnings = $Warnings | Where-Object { $_.Severity -eq "LOW" }
    
    $md = "# $ReportTitle`n`n"
    $md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
    $md += "---`n`n"
    
    if ($highWarnings.Count -gt 0) {
        $md += "## 🔴 HIGH RISK ($($highWarnings.Count) issues)`n`n"
        $md += "**Action Required Immediately**`n`n"
        foreach ($w in $highWarnings) {
            $md += "### $($w.IssueType)`n"
            $md += "- **File:** $($w.FilePath)`n"
            $md += "- **Details:** $($w.Details)`n"
            $md += "- **Time:** $($w.Timestamp)`n`n"
        }
    }
    
    if ($mediumWarnings.Count -gt 0) {
        $md += "## 🟡 MEDIUM RISK ($($mediumWarnings.Count) issues)`n`n"
        $md += "**Review Recommended**`n`n"
        foreach ($w in $mediumWarnings) {
            $md += "### $($w.IssueType)`n"
            $md += "- **File:** $($w.FilePath)`n"
            $md += "- **Details:** $($w.Details)`n"
            $md += "- **Time:** $($w.Timestamp)`n`n"
        }
    }
    
    if ($lowWarnings.Count -gt 0) {
        $md += "## 🔵 LOW RISK ($($lowWarnings.Count) issues)`n`n"
        $md += "**For Reference**`n`n"
        foreach ($w in $lowWarnings) {
            $md += "### $($w.IssueType)`n"
            $md += "- **File:** $($w.FilePath)`n"
            $md += "- **Details:** $($w.Details)`n"
            $md += "- **Time:** $($w.Timestamp)`n`n"
        }
    }
    
    if ($Warnings.Count -eq 0) {
        $md += "## ✅ No Security Warnings`n`n"
        $md += "All checks passed. No issues detected.`n"
    }
    
    return $md
}

# ============================================================================
# 使用示例
# ============================================================================
<#
.SYNOPSIS
    风险警告模板库使用示例

.EXAMPLE
    # 写出一条高危警告
    Write-Security-Warning -Severity "HIGH" -IssueType "Malware Detected" -Details "Trojan signature found" -FilePath "C:\suspicious.exe"

.EXAMPLE
    # 生成预设警告
    $warning = New-Malware-Warning -FilePath "C:\malware.exe" -MalwareType "Trojan.Generic"
    Write-Host $warning.Formatted -ForegroundColor Red

.EXAMPLE
    # 生成 Markdown 报告
    $warnings = @(
        (New-Malware-Warning -FilePath "C:\bad.exe").Raw,
        (New-SensitiveData-Warning -FilePath "C:\config.json" -DataType "API Key").Raw
    )
    $report = ConvertTo-MarkdownWarning -Warnings $warnings
    $report | Out-File "security-report.md"
#>
