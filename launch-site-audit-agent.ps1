#!/usr/bin/env powershell
# Site Audit Agent Launcher Script
# This script launches the Site Audit Agent with all its capabilities

# Set error handling
$ErrorActionPreference = "Stop"

# Configuration
$AgentName = "SiteAuditAgent"
$InstanceName = "main"
$ApiBaseUrl = "http://localhost:8080"

# Colors for output
function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

Write-ColorOutput "=== Site Audit Agent Launcher ===" "Green"
Write-ColorOutput "Initializing Site Audit Agent..." "Yellow"

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "Node.js is not installed. Please install Node.js to run the agent." "Red"
    exit 1
}

# Check if wrangler is available
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "Wrangler CLI is not available. Please install Cloudflare Wrangler." "Red"
    exit 1
}

# Start the agent
Write-ColorOutput "Starting Site Audit Agent..." "Yellow"

# Set environment variables
$env:API_BASE_URL = $ApiBaseUrl
$env:WORKER_URL = $ApiBaseUrl

# Run the agent
Write-ColorOutput "Agent is running. Available commands:" "Green"
Write-ColorOutput "1. Start full audit - calls /agents/site-audit/main/startFullAudit" "Cyan"
Write-ColorOutput "2. Check Adsense prerequisites - calls /agents/site-audit/main/checkAdsensePrerequisites" "Cyan"
Write-ColorOutput "3. Spawn sub-agent - calls /agents/site-audit/main/spawnSubAgentForSite" "Cyan"
Write-ColorOutput "4. Deploy all sites - calls /agents/site-audit/main/deployAllSites" "Cyan"
Write-ColorOutput "5. Exit" "Cyan"

# Keep the script running
while ($true) {
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" {
            Write-ColorOutput "Starting full audit..." "Yellow"
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl/agents/site-audit/$AgentName/$InstanceName/startFullAudit" -Method POST
            Write-ColorOutput "Audit started: $response" "Green"
        }
        "2" {
            $siteUrl = Read-Host "Enter site URL to check"
            Write-ColorOutput "Checking Adsense prerequisites for $siteUrl..." "Yellow"
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl/agents/site-audit/$AgentName/$InstanceName/checkAdsensePrerequisites?siteUrl=$siteUrl" -Method POST
            Write-ColorOutput "Check result: $response" "Green"
        }
        "3" {
            $siteId = Read-Host "Enter site ID to spawn sub-agent for"
            Write-ColorOutput "Spawning sub-agent for site $siteId..." "Yellow"
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl/agents/site-audit/$AgentName/$InstanceName/spawnSubAgentForSite" -Method POST -Body "{\"siteId\": \"$siteId\"}" -ContentType "application/json"
            Write-ColorOutput "Sub-agent spawned: $response" "Green"
        }
        "4" {
            Write-ColorOutput "Deploying all sites..." "Yellow"
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl/agents/site-audit/$AgentName/$InstanceName/deployAllSites" -Method POST
            Write-ColorOutput "Deployment result: $response" "Green"
        }
        "5" {
            Write-ColorOutput "Exiting..." "Yellow"
            exit 0
        }
        default {
            Write-ColorOutput "Invalid choice. Please try again." "Red"
        }
    }
}
