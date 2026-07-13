param(
  [string]$EnvFile,
  [string]$PagesProject,
  [string]$WorkerName = 'apex-citadel-api',
  [switch]$SkipValidation
)

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\Import-GlobalEnv.ps1"

function Get-EnvValue {
  param([string[]]$Names, [string]$Default)
  foreach ($name in $Names) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value
    }
  }
  return $Default
}

$repoRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $repoRoot

$loaded = Import-GlobalEnv -Path $EnvFile
if (-not [Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'Process')) {
  $fallbackToken = [Environment]::GetEnvironmentVariable('CLOUDFLARE_ACCOUNT_API_TOKEN', 'Process')
  if ($fallbackToken) {
    [Environment]::SetEnvironmentVariable('CLOUDFLARE_API_TOKEN', $fallbackToken, 'Process')
  }
}

if (-not [Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'Process')) {
  throw 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_API_TOKEN in global.env.'
}

$projectName = Get-EnvValue -Names @('CF_PAGES_PROJECT') -Default '3000studios-vip'
if ($PagesProject) {
  $projectName = $PagesProject
}

Write-Output "Loaded $($loaded.Names.Count) env names from $($loaded.Path). Values are masked."

if (-not $SkipValidation) {
  npm run test --workspace apps/api
  npm run test --workspace apps/web -- --run
  npm run build
}

Push-Location apps\api
try {
  npx wrangler deploy --name $WorkerName
} finally {
  Pop-Location
}

npx wrangler pages deploy apps/web/dist --project-name $projectName --branch main --commit-dirty=true
