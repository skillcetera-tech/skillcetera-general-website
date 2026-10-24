$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$assetDirectory = Join-Path $projectRoot 'public/assets'
New-Item -ItemType Directory -Path $assetDirectory -Force | Out-Null
$apiRoot = 'https://skillcetera.notion.site/api/v3'
$mainPage = '10c45c41-2622-8088-bb92-f78a8586ba54'

function Read-PublicPage([string] $pageId) {
    $blocks = @{}
    $cursor = @{ stack = @() }
    for ($part = 0; $part -lt 8; $part++) {
        $payload = @{ pageId=$pageId; limit=100; cursor=$cursor; chunkNumber=$part; verticalColumns=$false } | ConvertTo-Json -Depth 20 -Compress
        $data = Invoke-RestMethod -Uri "$apiRoot/loadPageChunk" -Method Post -ContentType 'application/json' -Body $payload
        foreach ($property in $data.recordMap.block.PSObject.Properties) {
            $block = $property.Value.value.value
            if (-not $block) { $block = $property.Value.value }
            if ($block.id) { $blocks[$block.id] = $block }
        }
        $cursor = $data.cursor
        if (-not $cursor.stack -or $cursor.stack.Count -eq 0) { return $blocks }
    }
    throw 'Public page pagination exceeded the bounded read.'
}

$blocks = Read-PublicPage $mainPage
$targets = @(
    @{ file='skillcetera-logo.png'; id=$mainPage; section='brand'; property='icon' },
    @{ file='skillcetera-mark.jpg'; id='10c45c41-2622-80b4-b711-c64f2068da49'; section='brand'; property='image' },
    @{ file='discussion-forum.png'; id='10d45c41-2622-8017-9b8c-c69e5b6db737'; section='discussion-forum'; property='image' },
    @{ file='scavenger-hunt.png'; id='27945c41-2622-80ea-be76-fcb8576429e4'; section='scavenger-hunt'; property='image' },
    @{ file='esc.png'; id='27945c41-2622-8067-a639-f4ac07f688c4'; section='esc'; property='image' },
    @{ file='s-store.jpg'; id='10d45c41-2622-8011-a3cc-fd2d09caf63a'; section='s-store'; property='image' },
    @{ file='meditation-retreat.jpg'; id='10d45c41-2622-804f-9f6f-f9d085aa4cd4'; section='meditation-retreat'; property='image' },
    @{ file='tedx.jpg'; id='10d45c41-2622-80eb-9c9c-fcd697f9cadf'; section='tedx'; property='image' },
    @{ file='moneyverse.png'; id='10d45c41-2622-80de-80a8-f425a0b20502'; section='moneyverse'; property='image' }
)

$urlRequests = @()
foreach ($target in $targets) {
    $block = $blocks[$target.id]
    if (-not $block) { throw ('Public asset block not found: ' + $target.id) }
    if ($target.property -eq 'icon') { $original = $block.format.page_icon }
    elseif ($block.format.original_source) { $original = $block.format.original_source }
    else { $original = $block.properties.source[0][0] }
    $target.original = $original
    $urlRequests += @{ url=$original; permissionRecord=@{ table='block'; id=$target.id } }
}
$signPayload = @{ urls=$urlRequests } | ConvertTo-Json -Depth 10 -Compress
$signed = Invoke-RestMethod -Uri "$apiRoot/getSignedFileUrls" -Method Post -ContentType 'application/json' -Body $signPayload
if ($signed.signedUrls.Count -ne $targets.Count) { throw 'Notion returned a different number of asset URLs.' }

$manifestAssets = @()
$descriptions = @{
    'skillcetera-logo.png' = 'Original red circular Skillcetera S/snake emblem on white.'
    'skillcetera-mark.jpg' = 'Original Skillcetera emblem and wordmark artwork on red and purple geometric background.'
    'discussion-forum.png' = 'A collage of original Discussion Forum promotional posters; not a documentary event photo.'
    'scavenger-hunt.png' = 'Group holding the Skillcetera Scavenger Hunt banner in an outdoor courtyard.'
    'esc.png' = 'Group at English Speaking Competition 2025 with BREAK THE NORM and GRAND FINAL SHOW stage backdrop.'
    's-store.jpg' = 'Original S-Store and Coolmate collaboration artwork.'
    'meditation-retreat.jpg' = 'Participants seated during a meditation retreat in an open pavilion.'
    'tedx.jpg' = 'Original TEDxFPTUniversityHCMC Season 04 START SMALL thank-you group artwork, associated with the 2024 theme; not a 2025 photo.'
    'moneyverse.png' = 'Group on the MoneyVerse stage with VTV Times branding visible.'
}
Add-Type -AssemblyName System.Drawing
for ($index=0; $index -lt $targets.Count; $index++) {
    $target = $targets[$index]
    $output = Join-Path $assetDirectory $target.file
    Invoke-WebRequest -Uri $signed.signedUrls[$index] -UseBasicParsing -OutFile $output
    $image = [System.Drawing.Image]::FromFile($output)
    $manifestAssets += [ordered]@{
        path='/public/assets/' + $target.file
        file='public/assets/' + $target.file
        section=$target.section
        description=$descriptions[$target.file]
        sourcePage='https://skillcetera.notion.site/2025'
        sourceBlock=$target.id
        originalUrl=$target.original
        width=$image.Width
        height=$image.Height
        bytes=(Get-Item -LiteralPath $output).Length
        verified='Downloaded and decoded as an image; content period not inferred.'
    }
    $image.Dispose()
    Write-Output ('Downloaded ' + $target.file)
}

$childPages = @()
foreach ($child in @(
    @{ id='fff45c41-2622-8114-95dc-f4e782387e42'; name='Contact' },
    @{ id='fff45c41-2622-8161-befb-d4fe464f6329'; name='Join us' }
)) {
    $childBlocks = Read-PublicPage $child.id
    $texts = @()
    $links = @()
    foreach ($block in $childBlocks.Values) {
        if ($block.properties.title) { $texts += (($block.properties.title | ForEach-Object { $_[0] }) -join '') }
        if ($block.properties) {
            $rawProperties = $block.properties | ConvertTo-Json -Depth 20 -Compress
            foreach ($match in [regex]::Matches($rawProperties, 'https?://[^"\s\\]+')) { $links += $match.Value }
        }
    }
    $childPages += [ordered]@{ name=$child.name; id=$child.id; sourceUrl='https://skillcetera.notion.site/' + $child.id.Replace('-',''); text=$texts; observedLinks=@($links | Select-Object -Unique); destinationChecks='Not externally followed; registration status unknown.' }
}

$manifest = [ordered]@{
    retrievedInSession='2026-10-24'
    source='https://skillcetera.notion.site/2025'
    assets=$manifestAssets
    childPages=$childPages
    notes='Original public Notion assets only. Retrieval date is not a reporting or event date. Signed download URLs are not persisted.'
}
$manifestPath = Join-Path $projectRoot 'docs/content/asset-manifest.json'
$manifest | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Output ('Saved ' + $manifestAssets.Count + ' images and child-page observations to docs/content/asset-manifest.json')
