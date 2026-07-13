param(
  [string]$EnvFile,
  [string]$PagesProject,
  [string]$WorkerName = 'apex-citadel-api',
  [switch]$DryRun
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

function Get-Sha256Hex {
  param([string]$Value)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
    $hash = $sha.ComputeHash($bytes)
    return ($hash | ForEach-Object { $_.ToString('x2') }) -join ''
  } finally {
    $sha.Dispose()
  }
}

function Invoke-CloudflareApi {
  param(
    [ValidateSet('GET', 'PATCH', 'PUT')]
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  $headers = @{
    Authorization = "Bearer $script:CloudflareToken"
    'Content-Type' = 'application/json'
  }

  $uri = "https://api.cloudflare.com/client/v4$Path"
  try {
    if ($null -eq $Body) {
      return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
    }

    $json = $Body | ConvertTo-Json -Depth 20
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json
  } catch {
    $response = $_.Exception.Response
    if ($response -and $response.GetResponseStream()) {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $bodyText = $reader.ReadToEnd()
      if ($bodyText) {
        throw "Cloudflare API $Method $Path failed: $bodyText"
      }
    }
    throw
  }
}

function New-PagesEnvVar {
  param([string]$Value, [bool]$Secret)
  @{
    type = $(if ($Secret) { 'secret_text' } else { 'plain_text' })
    value = $Value
  }
}

$loaded = Import-GlobalEnv -Path $EnvFile

$script:CloudflareToken = Get-EnvValue -Names @('CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_API_TOKEN') -Default $null
$accountId = Get-EnvValue -Names @('CLOUDFLARE_ACCOUNT_ID') -Default $null
$projectName = Get-EnvValue -Names @('CF_PAGES_PROJECT') -Default '3000studios-vip'
if ($PagesProject) {
  $projectName = $PagesProject
}

if (-not $script:CloudflareToken) {
  throw 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_API_TOKEN in global.env.'
}
if (-not $accountId) {
  throw 'Missing CLOUDFLARE_ACCOUNT_ID in global.env.'
}

$passcodeHash = Get-EnvValue -Names @('VITE_VAULT_PASSCODE_SHA256') -Default $null
if (-not $passcodeHash) {
  $passcode = Get-EnvValue -Names @('ADMIN_PASSCODE', 'ADMIN_ACCESS_CODE', 'CONTROL_PASSWORD') -Default $null
  if ($passcode) {
    $passcodeHash = Get-Sha256Hex -Value $passcode
  }
}

$answerHash = Get-EnvValue -Names @('VITE_VAULT_SECRET_ANSWER_SHA256') -Default $null
if (-not $answerHash) {
  $answer = Get-EnvValue -Names @('VITE_VAULT_SECRET_ANSWER', 'SECRET_QUESTION_ANSWER', 'ADMIN_SECRET_ANSWER') -Default $null
  if ($answer) {
    $answerHash = Get-Sha256Hex -Value $answer.Trim().ToLowerInvariant()
  }
}

$pagesValues = [ordered]@{
  NODE_VERSION = Get-EnvValue -Names @('NODE_VERSION') -Default '22'
  APP_ENV = Get-EnvValue -Names @('APP_ENV') -Default 'production'
  ACCESS_REQUIRED = Get-EnvValue -Names @('ACCESS_REQUIRED') -Default '1'
  VITE_API_BASE = Get-EnvValue -Names @('VITE_API_BASE', 'VITE_API_BASE_URL') -Default 'https://api.3000studios.vip'
  VITE_VAULT_USERNAME = Get-EnvValue -Names @('VITE_VAULT_USERNAME', 'OWNER_ADMIN_EMAIL', 'OWNER_EMAIL', 'ADMIN_EMAIL') -Default 'Mr.jwswain@gmail.com'
  VITE_VAULT_PASSCODE_SHA256 = $passcodeHash
  VITE_VAULT_SECRET_ANSWER_SHA256 = $answerHash
  VITE_STREAM_CUSTOMER_CODE = Get-EnvValue -Names @('VITE_STREAM_CUSTOMER_CODE', 'STREAM_CUSTOMER_CODE') -Default $null
  VITE_STREAM_LIVE_INPUT_ID = Get-EnvValue -Names @('VITE_STREAM_LIVE_INPUT_ID', 'STREAM_LIVE_INPUT_ID') -Default $null
  VITE_STREAM_TITLE = Get-EnvValue -Names @('VITE_STREAM_TITLE') -Default '3000 Studios Private Stream'
  VITE_ADSENSE_CLIENT_ID = Get-EnvValue -Names @('VITE_ADSENSE_CLIENT_ID', 'ADSENSE_CLIENT_ID') -Default 'ca-pub-5800977493749262'
  VITE_ADSENSE_HOME_SLOT = Get-EnvValue -Names @('VITE_ADSENSE_HOME_SLOT', 'ADSENSE_HOME_SLOT') -Default $null
  VITE_ADSENSE_MUSIC_SLOT = Get-EnvValue -Names @('VITE_ADSENSE_MUSIC_SLOT', 'ADSENSE_MUSIC_SLOT') -Default $null
  VITE_ADSENSE_VIDEO_SLOT = Get-EnvValue -Names @('VITE_ADSENSE_VIDEO_SLOT', 'ADSENSE_VIDEO_SLOT') -Default $null
  VITE_ADSENSE_LIVE_SLOT = Get-EnvValue -Names @('VITE_ADSENSE_LIVE_SLOT', 'ADSENSE_LIVE_SLOT') -Default $null
  VITE_ADSENSE_BLOG_SLOT = Get-EnvValue -Names @('VITE_ADSENSE_BLOG_SLOT', 'ADSENSE_BLOG_SLOT') -Default $null
}

$secretPageNames = @(
  'VITE_VAULT_PASSCODE_SHA256',
  'VITE_VAULT_SECRET_ANSWER_SHA256',
  'VITE_STREAM_CUSTOMER_CODE',
  'VITE_STREAM_LIVE_INPUT_ID'
)

$envVars = @{}
$missingPages = New-Object System.Collections.Generic.List[string]
foreach ($entry in $pagesValues.GetEnumerator()) {
  if ([string]::IsNullOrWhiteSpace($entry.Value)) {
    $missingPages.Add($entry.Key) | Out-Null
    continue
  }
  $envVars[$entry.Key] = New-PagesEnvVar -Value $entry.Value -Secret ($secretPageNames -contains $entry.Key)
}

$workerSecrets = [ordered]@{
  CLOUDFLARE_ACCOUNT_ID = $accountId
  CLOUDFLARE_API_TOKEN = $script:CloudflareToken
  ALERT_FROM_EMAIL = Get-EnvValue -Names @('ALERT_FROM_EMAIL') -Default 'alerts@3000studios.vip'
  MAILCHANNELS_API_KEY = Get-EnvValue -Names @('MAILCHANNELS_API_KEY') -Default $null
  DUDE_SYNC_TOKEN = Get-EnvValue -Names @('DUDE_SYNC_TOKEN', 'X_ORCH_TOKEN', 'ORCH_TOKEN') -Default $null
}

$missingWorker = New-Object System.Collections.Generic.List[string]
$workerSecretPayloads = New-Object System.Collections.Generic.List[object]
foreach ($entry in $workerSecrets.GetEnumerator()) {
  if ([string]::IsNullOrWhiteSpace($entry.Value)) {
    $missingWorker.Add($entry.Key) | Out-Null
    continue
  }
  $workerSecretPayloads.Add(@{
    name = $entry.Key
    text = $entry.Value
    type = 'secret_text'
  }) | Out-Null
}

Write-Output "Loaded $($loaded.Names.Count) env names from $($loaded.Path). Values are masked."
Write-Output "Prepared $($envVars.Keys.Count) Cloudflare Pages env names for project $projectName."
if ($missingPages.Count -gt 0) {
  Write-Output "Missing Pages env names: $($missingPages -join ', ')"
}
Write-Output "Prepared $($workerSecretPayloads.Count) Worker secret names for $WorkerName."
if ($missingWorker.Count -gt 0) {
  Write-Output "Missing Worker secret names: $($missingWorker -join ', ')"
}

if ($DryRun) {
  Write-Output 'Dry run only. No Cloudflare values were changed.'
  exit 0
}

$pagesBody = @{
  deployment_configs = @{
    production = @{ env_vars = $envVars }
    preview = @{ env_vars = $envVars }
  }
}

$pagesResult = Invoke-CloudflareApi -Method PATCH -Path "/accounts/$accountId/pages/projects/$projectName" -Body $pagesBody
if (-not $pagesResult.success) {
  throw "Cloudflare Pages env sync failed for $projectName."
}
Write-Output "Cloudflare Pages env sync succeeded for $projectName."

foreach ($secret in $workerSecretPayloads) {
  Write-Output "Syncing Worker secret name: $($secret.name)"
  $result = Invoke-CloudflareApi -Method PUT -Path "/accounts/$accountId/workers/scripts/$WorkerName/secrets" -Body $secret
  if (-not $result.success) {
    throw "Worker secret sync failed for $($secret.name)."
  }
}

Write-Output "Worker secret sync succeeded for $WorkerName."
