$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$vendorDirectory = Join-Path $projectRoot 'public/vendor'
$fontDirectory = Join-Path $projectRoot 'public/fonts'
New-Item -ItemType Directory -Path $vendorDirectory,$fontDirectory -Force | Out-Null
$runtimeFiles = @{
  'gsap.min.js' = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'
  'ScrollTrigger.min.js' = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js'
}
foreach ($entry in $runtimeFiles.GetEnumerator()) {
  Invoke-WebRequest -Uri $entry.Value -UseBasicParsing -OutFile (Join-Path $vendorDirectory $entry.Key)
}
$fontUrl = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap'
$headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' }
$fontCss = (Invoke-WebRequest -Uri $fontUrl -Headers $headers -UseBasicParsing).Content
$fontMatches = [regex]::Matches($fontCss, 'https://fonts\.gstatic\.com/[^)\s]+')
$fontMap = @{}
$fontIndex = 0
foreach ($match in $fontMatches) {
  if (-not $fontMap.ContainsKey($match.Value)) {
    $fontIndex++
    $fontName = 'be-vietnam-pro-' + $fontIndex + '.woff2'
    Invoke-WebRequest -Uri $match.Value -UseBasicParsing -OutFile (Join-Path $fontDirectory $fontName)
    $fontMap[$match.Value] = './' + $fontName
  }
}
foreach ($fontSource in $fontMap.Keys) { $fontCss = $fontCss.Replace($fontSource, $fontMap[$fontSource]) }
[System.IO.File]::WriteAllText((Join-Path $fontDirectory 'fonts.css'), $fontCss, [System.Text.UTF8Encoding]::new($false))
Write-Output ('Downloaded GSAP 3.13.0 and ' + $fontMap.Count + ' local font files.')
