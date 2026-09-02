param(
  [Parameter(Mandatory = $true)]
  [string]$Song,

  [string]$LyricsPath = "",
  [string]$Style = "cinematic",
  [string]$Platform = "youtube",
  [string]$Mood = "cinematic, bold, viral, expensive-looking",
  [string]$OutputRoot = "C:\Users\MrJws\Music\Music Videos",
  [switch]$RenderDraft
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$musicDataPath = Join-Path $repoRoot "apps\web\src\data\music.ts"
$mediaRoot = Join-Path $repoRoot "apps\web\public"
$globalEnvCandidates = @("C:\Users\MrJws\Documents\global.env")

function Import-EnvFile {
  param([string]$Path)
  if (!(Test-Path -LiteralPath $Path)) { return }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (!$line -or $line.StartsWith("#") -or $line -notmatch "^[A-Za-z_][A-Za-z0-9_]*=") { return }
    $pair = $line -split "=", 2
    $name = $pair[0].Trim()
    $value = $pair[1].Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

function ConvertTo-Slug {
  param([string]$Value)
  $slug = $Value.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
  return ($slug -replace "^-|-$", "")
}

function Resolve-PublicPath {
  param([string]$PublicPath)
  if (!$PublicPath) { return $null }
  $relative = $PublicPath.TrimStart("/") -replace "/", "\"
  $candidate = Join-Path $mediaRoot $relative
  if (Test-Path -LiteralPath $candidate) { return $candidate }
  return $null
}

function Get-CatalogSongs {
  if (!(Test-Path -LiteralPath $musicDataPath)) { return @() }
  $text = Get-Content -LiteralPath $musicDataPath -Raw
  $pattern = "enrich\((?<rank>\d+),\s*'(?<slug>[^']+)',\s*'(?<title>(?:\\'|[^'])*)',\s*'(?<desc>(?:\\'|[^'])*)',\s*'(?<src>[^']+)'\)"
  $matches = [regex]::Matches($text, $pattern)
  return $matches | ForEach-Object {
    [pscustomobject]@{
      Rank = [int]$_.Groups["rank"].Value
      Slug = $_.Groups["slug"].Value
      Title = ($_.Groups["title"].Value -replace "\\'", "'")
      Description = ($_.Groups["desc"].Value -replace "\\'", "'")
      Src = $_.Groups["src"].Value
    }
  }
}

function Split-Lyrics {
  param([string]$Text)
  $lines = $Text -split "(`r`n|`n){1,2}" |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and $_ -notmatch "^`r?$" }
  if ($lines.Count -eq 0) {
    return @("Instrumental opening", "First verse energy", "Main hook", "Second verse", "Final hook")
  }
  return @($lines | Select-Object -First 18)
}

function Get-StyleDirection {
  param([string]$Name)
  switch ($Name.ToLowerInvariant()) {
    "neon" { "black studio, animated LED walls, neon reflections, smoke, chrome details, audio-reactive light pulses" }
    "street" { "night city energy, handheld motion, bold poster typography, performance cuts, flash photography accents" }
    "surreal" { "dreamlike symbolic scenes, impossible rooms, lyric objects becoming real, smooth transitions, rich atmosphere" }
    "performance" { "artist-led performance, closeups, crowd moments, stage lights, confident camera push-ins, clean editorial pacing" }
    "visualizer" { "album art world, animated waveform, beat-synced particles, abstract 3D motion, readable lyric overlays" }
    default { "premium music-video lighting, camera movement, grounded locations, dramatic closeups, polished color grade" }
  }
}

function Get-PlatformFormat {
  param([string]$Name)
  switch ($Name.ToLowerInvariant()) {
    "shorts" { "9:16 vertical, 1080x1920, strongest hook first, under 60 seconds when possible" }
    "tiktok" { "9:16 vertical, 1080x1920, fast captions, hook in first 2 seconds" }
    "instagram" { "9:16 vertical, 1080x1920, polished captions, high-contrast cover frame" }
    default { "16:9 landscape, 1920x1080, full song, clean intro/outro" }
  }
}

foreach ($candidate in $globalEnvCandidates) {
  if (Test-Path -LiteralPath $candidate) {
    Import-EnvFile -Path $candidate
    break
  }
}

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null

$catalog = @(Get-CatalogSongs)
$needle = $Song.Trim().ToLowerInvariant()
$songEntry = $catalog | Where-Object {
  $_.Slug.ToLowerInvariant() -eq $needle -or
  $_.Title.ToLowerInvariant() -eq $needle -or
  $_.Title.ToLowerInvariant().Contains($needle) -or
  $_.Slug.ToLowerInvariant().Contains((ConvertTo-Slug $needle))
} | Select-Object -First 1

$title = if ($songEntry) { $songEntry.Title } else { $Song.Trim() }
$slug = if ($songEntry) { $songEntry.Slug } else { ConvertTo-Slug $title }
$artist = if ($env:ARTIST_NAME) { $env:ARTIST_NAME } else { "3000 Studios" }
$site = if ($env:ARTIST_SITE) { $env:ARTIST_SITE } else { "https://3000studios.vip" }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$jobDir = Join-Path $OutputRoot "$stamp-$slug"
New-Item -ItemType Directory -Path $jobDir -Force | Out-Null

$lyrics = ""
if ($LyricsPath -and (Test-Path -LiteralPath $LyricsPath)) {
  $lyrics = Get-Content -LiteralPath $LyricsPath -Raw
}

$audioPath = $null
if ($songEntry) {
  $audioPath = Resolve-PublicPath $songEntry.Src
  if ($audioPath) {
    Copy-Item -LiteralPath $audioPath -Destination (Join-Path $jobDir (Split-Path -Leaf $audioPath)) -Force
  }
}

$coverPath = $null
$coverCandidates = @(
  "/media/covers/$slug.jpg",
  "/media/covers/$slug.png",
  "/media/covers/$slug.svg",
  "/media/$title.jpg"
)
foreach ($candidate in $coverCandidates) {
  $resolved = Resolve-PublicPath $candidate
  if ($resolved) {
    $coverPath = $resolved
    Copy-Item -LiteralPath $resolved -Destination (Join-Path $jobDir (Split-Path -Leaf $resolved)) -Force
    break
  }
}

$lines = @(Split-Lyrics $lyrics)
$styleDirection = Get-StyleDirection $Style
$platformFormat = Get-PlatformFormat $Platform
$durationPerScene = if ($Platform -eq "youtube") { 12 } else { 4 }
$scenes = for ($i = 0; $i -lt $lines.Count; $i++) {
  $line = $lines[$i]
  $keywords = (($line -replace "[^\w\s']", "") -split "\s+" | Where-Object { $_.Length -gt 3 } | Select-Object -First 7) -join " "
  if (!$keywords) { $keywords = "the main lyric and song emotion" }
  [pscustomobject]@{
    id = ("{0:D2}" -f ($i + 1))
    timing = ("{0}s-{1}s" -f ($i * $durationPerScene), (($i + 1) * $durationPerScene))
    lyric = $line
    prompt = "Music video scene for `"$title`" by $artist`: $keywords. $styleDirection. Mood: $Mood. $platformFormat. No fake brands, no unreadable text, leave clean space for lyric captions."
    edit = if ($i % 3 -eq 0) { "Slow push-in, cut on snare, lyric caption enters from bottom." } elseif ($i % 3 -eq 1) { "Match cut into motion, add quick flash on the last word." } else { "Hold the strongest frame, add beat pulse and caption emphasis." }
  }
}

$metadata = [pscustomobject]@{
  song = $title
  artist = $artist
  slug = $slug
  style = $Style
  platform = $Platform
  format = $platformFormat
  audioFound = [bool]$audioPath
  coverFound = [bool]$coverPath
  outputFolder = $jobDir
  generatedAt = (Get-Date).ToString("o")
}

$planText = @"
# $title - Music Video Production Package

Artist: $artist
Style: $Style
Platform: $Platform
Format: $platformFormat
Mood: $Mood

## Production Order

1. Generate or choose cover frame.
2. Generate each scene as a 4-12 second AI clip.
3. Edit clips to the beat.
4. Add readable lyric captions.
5. Color match and export.
6. Upload to YouTube, Shorts, TikTok, and Reels as needed.

## Scenes

$($scenes | ForEach-Object {
"### $($_.id) $($_.timing)

Lyric:
$($_.lyric)

Prompt:
$($_.prompt)

Edit:
$($_.edit)
"
} | Out-String)

## Thumbnail Prompt

$artist - $title official music video cover frame, $styleDirection, bold readable title space, high contrast, premium music release artwork, $Mood.

## Upload Metadata

Title: $artist - $title (Official Music Video)

Description:
Watch the official $title music video by $artist. Stream more music, live shows, and 3000 Studios drops at $site/

Tags:
3000 Studios, official music video, AI music video, new music, independent artist, lyric video
"@

$metadata | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $jobDir "metadata.json") -Encoding UTF8
$scenes | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $jobDir "scene-prompts.json") -Encoding UTF8
$planText | Set-Content -LiteralPath (Join-Path $jobDir "production-plan.md") -Encoding UTF8
$lyrics | Set-Content -LiteralPath (Join-Path $jobDir "lyrics.txt") -Encoding UTF8

if ($RenderDraft -and $audioPath -and $coverPath) {
  $ffmpeg = Get-Command ffmpeg.exe -ErrorAction SilentlyContinue
  if ($ffmpeg) {
    $draftPath = Join-Path $jobDir "$slug-draft-visualizer.mp4"
    & $ffmpeg.Source -y -loop 1 -i $coverPath -i $audioPath -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest $draftPath | Out-Null
  }
}

Write-Output "Music video package created: $jobDir"
