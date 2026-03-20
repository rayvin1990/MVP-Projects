# Remediation Generator - 修复建议生成器
# Author: Nia (AI Assistant)
# Created: 2026-03-11
# Purpose: 根据问题类型自动生成修复方案

# ============================================================================
# 修复方案知识库
# ============================================================================

$RemediationKnowledge = @{
    Malware = @{
        Title = "恶意软件清除"
        Severity = "HIGH"
        Steps = @(
            "立即隔离受感染文件到 quarantine 目录",
            "运行完整系统杀毒扫描",
            "检查系统启动项和计划任务",
            "审查最近的文件修改记录",
            "更新杀毒软件病毒库",
            "考虑系统还原到安全时间点"
        )
        Commands = @(
            "Move-Item -Path '<file>' -Destination 'quarantine/' -Force",
            "Start-MpScan -ScanType FullScan",
            "Get-ScheduledTask | Where-Object { $_.State -eq 'Ready' }",
            "Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
        )
        Verification = "运行安全扫描确认无残留威胁"
        Prevention = "启用实时防护，定期更新病毒库，不执行未知来源文件"
    }
    
    SensitiveData = @{
        Title = "敏感数据泄露修复"
        Severity = "HIGH"
        Steps = @(
            "立即撤销/轮换泄露的凭证",
            "从代码库中移除敏感信息",
            "添加文件到 .gitignore",
            "检查 git 历史是否已提交敏感数据",
            "审查访问日志确认是否有未授权访问",
            "更新密钥管理系统"
        )
        Commands = @(
            "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <file>' HEAD",
            "echo '<file>' >> .gitignore",
            "git add .gitignore",
            "git commit -m 'Add sensitive files to gitignore'"
        )
        Verification = "确认敏感数据已从代码库和日志中彻底清除"
        Prevention = "使用环境变量或密钥管理服务，不硬编码凭证"
    }
    
    SuspiciousExtension = @{
        Title = "可疑扩展名文件处理"
        Severity = "MEDIUM"
        Steps = @(
            "确认文件来源和用途",
            "在沙箱环境中测试文件行为",
            "检查文件数字签名",
            "扫描文件病毒特征",
            "如无合法用途则隔离删除"
        )
        Commands = @(
            "Get-AuthenticodeSignature '<file>'",
            "Invoke-Expression '& \"C:\\Program Files\\Windows Defender\\MpCmdRun.exe\" -Scan -ScanType 3 -File <file>'"
        )
        Verification = "确认文件为恶意或已安全隔离"
        Prevention = "限制可执行文件类型，启用应用白名单"
    }
    
    UnauthorizedChange = @{
        Title = "未授权变更修复"
        Severity = "MEDIUM"
        Steps = @(
            "对比变更前后文件差异",
            "确认变更是否为授权操作",
            "如为未授权则恢复原文件",
            "审查系统访问日志",
            "加强文件完整性监控"
        )
        Commands = @(
            "git diff HEAD~1 HEAD -- <file>",
            "git checkout HEAD -- <file>",
            "Get-EventLog -LogName Security -Newest 100"
        )
        Verification = "确认文件已恢复到已知安全状态"
        Prevention = "启用文件完整性监控，限制写权限"
    }
    
    ConfigIssue = @{
        Title = "配置问题修复"
        Severity = "LOW"
        Steps = @(
            "审查当前配置",
            "对照安全基线检查",
            "应用安全配置模板",
            "测试配置变更",
            "记录配置变更"
        )
        Commands = @(
            "# 根据具体配置类型应用相应修复",
            "# 示例：禁用不必要的服务",
            "Stop-Service -Name '<service>' -Force",
            "Set-Service -Name '<service>' -StartupType Disabled"
        )
        Verification = "运行配置审计确认符合安全基线"
        Prevention = "使用配置管理工具，定期审计配置"
    }
    
    NetworkAnomaly = @{
        Title = "网络异常处理"
        Severity = "HIGH"
        Steps = @(
            "识别异常连接的源和目标",
            "阻断可疑网络连接",
            "检查是否有恶意进程",
            "审查防火墙规则",
            "分析网络流量日志"
        )
        Commands = @(
            "Get-NetTCPConnection | Where-Object { $_.State -eq 'Established' }",
            "Get-Process | Where-Object { $_.Id -eq <pid> }",
            "New-NetFirewallRule -DisplayName 'Block Suspicious' -Direction Outbound -RemoteAddress <ip> -Action Block"
        )
        Verification = "确认异常连接已终止且无残留"
        Prevention = "启用网络监控，配置入侵检测系统"
    }
    
    PermissionIssue = @{
        Title = "权限问题修复"
        Severity = "MEDIUM"
        Steps = @(
            "审查当前权限设置",
            "识别过度授权",
            "应用最小权限原则",
            "测试权限变更不影响功能",
            "记录权限变更"
        )
        Commands = @(
            "Get-Acl '<path>' | Format-List",
            "$acl = Get-Acl '<path>'",
            "$rule = New-Object System.Security.AccessControl.FileSystemAccessRule('Users','ReadAndExecute','Allow')",
            "$acl.SetAccessRule($rule)",
            "Set-Acl '<path>' $acl"
        )
        Verification = "确认权限符合最小权限原则"
        Prevention = "定期审查权限，使用角色基础访问控制"
    }
    
    Default = @{
        Title = "通用安全修复"
        Severity = "MEDIUM"
        Steps = @(
            "隔离可疑文件/配置",
            "进行详细分析",
            "应用针对性修复",
            "验证修复效果",
            "记录事件和修复过程"
        )
        Commands = @()
        Verification = "运行安全扫描确认问题解决"
        Prevention = "保持系统更新，定期安全审计"
    }
}

# ============================================================================
# 修复建议生成函数
# ============================================================================

function Get-Remediation-Plan {
    param(
        [string]$IssueType,
        [string]$FilePath = "",
        [string]$Severity = "MEDIUM"
    )
    
    # 映射问题类型到知识库
    $knowledgeMap = @{
        "Malware" = "Malware"
        "Malware Detected" = "Malware"
        "Trojan" = "Malware"
        "Virus" = "Malware"
        "Sensitive Data" = "SensitiveData"
        "Sensitive Data Exposure" = "SensitiveData"
        "Credentials" = "SensitiveData"
        "API Key" = "SensitiveData"
        "Password" = "SensitiveData"
        "Suspicious Extension" = "SuspiciousExtension"
        "Suspicious File" = "SuspiciousExtension"
        "Unauthorized Change" = "UnauthorizedChange"
        "File Modified" = "UnauthorizedChange"
        "Configuration" = "ConfigIssue"
        "Config Issue" = "ConfigIssue"
        "Insecure Config" = "ConfigIssue"
        "Network" = "NetworkAnomaly"
        "Network Anomaly" = "NetworkAnomaly"
        "Suspicious Connection" = "NetworkAnomaly"
        "Permission" = "PermissionIssue"
        "Access Control" = "PermissionIssue"
        "Overly Permissive" = "PermissionIssue"
    }
    
    $knowledgeKey = $knowledgeMap[$IssueType]
    if (!$knowledgeKey) { $knowledgeKey = "Default" }
    
    $knowledge = $RemediationKnowledge[$knowledgeKey]
    if (!$knowledge) { $knowledge = $RemediationKnowledge["Default"] }
    
    return @{
        IssueType = $IssueType
        Title = $knowledge.Title
        Severity = $knowledge.Severity
        FilePath = $FilePath
        Steps = $knowledge.Steps
        Commands = $knowledge.Commands
        Verification = $knowledge.Verification
        Prevention = $knowledge.Prevention
        GeneratedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

function Format-Remediation-Plan {
    param(
        [hashtable]$Plan,
        [string]$Format = "Text"  # Text, Markdown, JSON
    )
    
    if ($Format -eq "Markdown") {
        $md = "## 🔧 Remediation Plan: $($Plan.Title)`n`n"
        $md += "**Issue Type:** $($Plan.IssueType)`n"
        $md += "**Severity:** $($Plan.Severity)`n"
        if ($Plan.FilePath) { $md += "**Affected File:** $($Plan.FilePath)`n" }
        $md += "**Generated:** $($Plan.GeneratedAt)`n`n"
        $md += "---`n`n"
        
        $md += "### Steps to Remediate`n`n"
        for ($i = 0; $i -lt $Plan.Steps.Count; $i++) {
            $md += "$($i + 1). $($Plan.Steps[$i])`n"
        }
        $md += "`n"
        
        if ($Plan.Commands.Count -gt 0) {
            $md += "### Commands`n`n"
            $md += "````powershell`n"
            foreach ($cmd in $Plan.Commands) {
                $md += "$cmd`n"
            }
            $md += "```` `n"
        }
        
        $md += "### Verification`n`n"
        $md += "$($Plan.Verification)`n`n"
        
        $md += "### Prevention`n`n"
        $md += "$($Plan.Prevention)`n"
        
        return $md
    }
    elseif ($Format -eq "JSON") {
        return $Plan | ConvertTo-Json -Depth 5
    }
    else {
        # Text format
        $text = "Remediation Plan: $($Plan.Title)`n"
        $text += "Issue Type: $($Plan.IssueType)`n"
        $text += "Severity: $($Plan.Severity)`n"
        if ($Plan.FilePath) { $text += "Affected File: $($Plan.FilePath)`n" }
        $text += "Generated: $($Plan.GeneratedAt)`n"
        $text += "`nSteps:`n"
        for ($i = 0; $i -lt $Plan.Steps.Count; $i++) {
            $text += "  $($i + 1). $($Plan.Steps[$i])`n"
        }
        if ($Plan.Verification) {
            $text += "`nVerification: $($Plan.Verification)`n"
        }
        if ($Plan.Prevention) {
            $text += "Prevention: $($Plan.Prevention)`n"
        }
        return $text
    }
}

function Write-Remediation-Plan {
    param(
        [string]$IssueType,
        [string]$FilePath = "",
        [string]$Format = "Text",
        [string]$OutputPath = ""
    )
    
    $plan = Get-Remediation-Plan -IssueType $IssueType -FilePath $FilePath
    $formatted = Format-Remediation-Plan -Plan $plan -Format $Format
    
    if ($OutputPath) {
        $formatted | Out-File -FilePath $OutputPath -Encoding UTF8
        Write-Host "Remediation plan saved to: $OutputPath" -ForegroundColor Green
    } else {
        Write-Host $formatted
    }
    
    return $plan
}

function Get-All-Remediation-Templates {
    param([string]$Format = "Markdown")
    
    $allPlans = @()
    foreach ($key in $RemediationKnowledge.Keys) {
        $plan = Get-Remediation-Plan -IssueType $key
        $allPlans += $plan
    }
    
    if ($Format -eq "Markdown") {
        $md = "# Security Remediation Templates`n`n"
        $md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
        $md += "This document contains standardized remediation procedures for common security issues.`n`n"
        $md += "---`n`n"
        
        foreach ($plan in $allPlans) {
            $md += Format-Remediation-Plan -Plan $plan -Format "Markdown"
            $md += "`n---`n`n"
        }
        
        return $md
    }
    
    return $allPlans
}

# ============================================================================
# 使用示例
# ============================================================================
<#
.SYNOPSIS
    修复建议生成器使用示例

.EXAMPLE
    # 获取特定问题的修复方案
    $plan = Get-Remediation-Plan -IssueType "Malware Detected" -FilePath "C:\suspicious.exe"
    Format-Remediation-Plan -Plan $plan -Format "Markdown"

.EXAMPLE
    # 直接输出修复方案
    Write-Remediation-Plan -IssueType "Sensitive Data Exposure" -FilePath "C:\config.json" -Format "Text"

.EXAMPLE
    # 生成所有修复模板文档
    $templates = Get-All-Remediation-Templates -Format "Markdown"
    $templates | Out-File "remediation-templates.md"
#>

# 如果直接运行脚本，显示帮助
if ($MyInvocation.ScriptName -and $MyInvocation.ScriptName -like "*.ps1" -and !$IssueType) {
    Write-Host "Remediation Generator - 修复建议生成器" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\remediation-generator.ps1 -IssueType <type> [-FilePath <path>] [-Format Text|Markdown|JSON]"
    Write-Host ""
    Write-Host "Supported Issue Types:" -ForegroundColor Yellow
    Write-Host "  - Malware Detected / Trojan / Virus"
    Write-Host "  - Sensitive Data Exposure / Credentials / API Key"
    Write-Host "  - Suspicious Extension / Suspicious File"
    Write-Host "  - Unauthorized Change / File Modified"
    Write-Host "  - Configuration Issue / Insecure Config"
    Write-Host "  - Network Anomaly / Suspicious Connection"
    Write-Host "  - Permission Issue / Access Control"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host '  .\remediation-generator.ps1 -IssueType "Malware Detected" -FilePath "C:\bad.exe" -Format Markdown'
    Write-Host '  .\remediation-generator.ps1 -IssueType "Sensitive Data Exposure" -Format Text'
}
