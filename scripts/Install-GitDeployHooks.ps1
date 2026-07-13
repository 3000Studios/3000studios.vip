param(
  [string]$EnvFile,
  [switch]$SkipValidation
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$gitDir = Join-Path $repoRoot '.git'
if (-not (Test-Path -LiteralPath $gitDir)) {
  throw "No .git directory found at $gitDir"
}

$hooksDir = Join-Path $gitDir 'hooks'
New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

$deployScript = Join-Path $repoRoot 'scripts\Deploy-Cloudflare.ps1'
$envArg = ''
if ($EnvFile) {
  $envArg = " -EnvFile `"$EnvFile`""
}
$validationArg = ''
if ($SkipValidation) {
  $validationArg = ' -SkipValidation'
}

$hookBody = @"
#!/bin/sh
echo "[3000studios.vip] Cloudflare auto-deploy hook running..."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$deployScript"$envArg$validationArg
"@

foreach ($hookName in @('post-commit', 'pre-push')) {
  $hookPath = Join-Path $hooksDir $hookName
  Set-Content -LiteralPath $hookPath -Value $hookBody -Encoding ascii
  Write-Output "Installed $hookName Cloudflare deploy hook."
}

Write-Output 'Local Git hooks installed. Values remain in global.env and Cloudflare, not in Git.'
