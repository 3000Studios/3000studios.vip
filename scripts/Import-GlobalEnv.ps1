param(
  [string]$EnvFile
)

$ErrorActionPreference = 'Stop'

function Get-DefaultGlobalEnvPath {
  $candidates = @(
    'C:\WorkSpaces\global.env',
    'C:\Users\Servi\.config\env\global.env',
    'C:\Users\Servi\OneDrive\Documents\global.env'
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }

  throw 'No global.env file was found in the supported machine locations.'
}

function Import-GlobalEnv {
  param(
    [string]$Path
  )

  if (-not $Path) {
    $Path = Get-DefaultGlobalEnvPath
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "global.env was not found at $Path"
  }

  $loaded = New-Object System.Collections.Generic.List[string]

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#') -or $line -notmatch '=') {
      return
    }

    $parts = $line -split '=', 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    if ($value.Length -ge 2) {
      $first = $value.Substring(0, 1)
      $last = $value.Substring($value.Length - 1, 1)
      if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }

    if ($name -match '^[A-Za-z_][A-Za-z0-9_]*$') {
      [Environment]::SetEnvironmentVariable($name, $value, 'Process')
      $loaded.Add($name) | Out-Null
    }
  }

  [pscustomobject]@{
    Path = $Path
    Names = $loaded.ToArray()
  }
}

if ($MyInvocation.InvocationName -ne '.') {
  $result = Import-GlobalEnv -Path $EnvFile
  Write-Output "Loaded $($result.Names.Count) env names from $($result.Path). Values are masked."
}
