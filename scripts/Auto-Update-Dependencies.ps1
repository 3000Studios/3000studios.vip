#Requires -Version 5.1
<#
.SYNOPSIS
    Auto-checks and updates all dependencies across the 3000Studios monorepo.
.DESCRIPTION
    Checks npm outdated in root and each workspace, updates non-major versions,
    runs lint and typecheck, and reports changes.
.NOTES
    Run from the repo root: .\scripts\Auto-Update-Dependencies.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

$root = Split-Path $PSScriptRoot -Parent
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$report = @()

Write-Host "=== 3000Studios Dependency Update - $timestamp ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check root outdated
Write-Host "[1/5] Checking root dependencies..." -ForegroundColor Yellow
$rootOutdated = npm outdated --json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($rootOutdated) {
    foreach ($pkg in $rootOutdated.PSObject.Properties) {
        $name = $pkg.Name
        $current = $pkg.Value.current
        $wanted = $pkg.Value.wanted
        $latest = $pkg.Value.latest
        $report += "ROOT: $name $current -> $wanted (latest: $latest)"
    }
    Write-Host "  Found $($rootOutdated.Count) outdated root packages" -ForegroundColor Yellow
} else {
    Write-Host "  Root dependencies are up to date" -ForegroundColor Green
}

# 2. Check each workspace
Write-Host "[2/5] Checking workspace dependencies..." -ForegroundColor Yellow
$workspaces = @("apps/web", "apps/api", "packages/shared")
foreach ($ws in $workspaces) {
    $wsPath = Join-Path $root $ws
    if (Test-Path "$wsPath\package.json") {
        Push-Location $wsPath
        $wsOutdated = npm outdated --json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($wsOutdated) {
            foreach ($pkg in $wsOutdated.PSObject.Properties) {
                $name = $pkg.Name
                $current = $pkg.Value.current
                $wanted = $pkg.Value.wanted
                $latest = $pkg.Value.latest
                $report += "$ws`: $name $current -> $wanted (latest: $latest)"
            }
            Write-Host "  $ws`: $($wsOutdated.Count) outdated" -ForegroundColor Yellow
        } else {
            Write-Host "  $ws`: up to date" -ForegroundColor Green
        }
        Pop-Location
    }
}

# 3. Check wrangler version
Write-Host "[3/5] Checking wrangler version..." -ForegroundColor Yellow
$wranglerCurrent = (wrangler --version 2>$null) -replace "[^\d.]", ""
$wranglerLatest = (npm view wrangler version 2>$null)
if ($wranglerCurrent -and $wranglerLatest) {
    if ($wranglerCurrent -ne $wranglerLatest) {
        $report += "wrangler: $wranglerCurrent -> $wranglerLatest"
        Write-Host "  wrangler: $wranglerCurrent -> $wranglerLatest" -ForegroundColor Yellow
    } else {
        Write-Host "  wrangler is up to date ($wranglerCurrent)" -ForegroundColor Green
    }
}

# 4. Update non-major versions
Write-Host "[4/5] Updating non-major versions..." -ForegroundColor Yellow
foreach ($ws in $workspaces) {
    $wsPath = Join-Path $root $ws
    if (Test-Path "$wsPath\package.json") {
        Push-Location $wsPath
        npm update --save 2>$null | Out-Null
        Pop-Location
        Write-Host "  Updated $ws" -ForegroundColor Green
    }
}
npm update --save 2>$null | Out-Null
Write-Host "  Updated root" -ForegroundColor Green

# 5. Run lint and typecheck
Write-Host "[5/5] Running lint and typecheck..." -ForegroundColor Yellow
$lintResult = npm run lint 2>&1
$buildResult = npm run build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Lint and build passed" -ForegroundColor Green
} else {
    Write-Host "  Lint/build had issues - check output" -ForegroundColor Red
}

# Report
Write-Host ""
Write-Host "=== Update Report ===" -ForegroundColor Cyan
if ($report.Count -gt 0) {
    $report | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "  All dependencies are up to date!" -ForegroundColor Green
}
Write-Host ""
Write-Host "Completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
