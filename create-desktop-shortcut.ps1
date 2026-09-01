#!/usr/bin/env powershell
# Create Desktop Shortcut for Site Audit Agent
# This script creates a desktop shortcut to launch the Site Audit Agent

# Set error handling
$ErrorActionPreference = "Stop"

# Configuration
$ShortcutPath = "$env:USERPROFILE\Desktop\SiteAuditAgent.lnk"
$ScriptPath = "$PSScriptRoot\launch-site-audit-agent.ps1"
$AgentName = "Site Audit Agent"

# Colors for output
function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

Write-ColorOutput "=== Creating Desktop Shortcut for Site Audit Agent ===" "Green"

# Check if the script exists
if (-not (Test-Path $ScriptPath)) {
    Write-ColorOutput "Script not found at $ScriptPath" "Red"
    Write-ColorOutput "Please run this script from the project directory" "Yellow"
    exit 1
}

# Create the shortcut
Write-ColorOutput "Creating shortcut at $ShortcutPath..." "Yellow"

# Use PowerShell's COM object to create the shortcut
$Shell = New-Object -ComObject "WScript.Shell"
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

# Set shortcut properties
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File '$ScriptPath'"
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.Description = "Site Audit Agent - Monitors sites for Adsense compliance and runs audits"
$Shortcut.IconLocation = "$env:windir\System32\imageres.dll,100"

# Save the shortcut
$Shortcut.Save()

Write-ColorOutput "Shortcut created successfully!" "Green"
Write-ColorOutput "You can now find 'Site Audit Agent' on your desktop" "Cyan"
Write-ColorOutput "Double-click the shortcut to launch the agent" "Cyan"

# Test the shortcut by running it
Write-ColorOutput "Testing the shortcut..." "Yellow"
Start-Process "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File '$ScriptPath'" -Wait

Write-ColorOutput "Test completed!" "Green"
