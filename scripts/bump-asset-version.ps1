param(
    [string]$Version = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss'),
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$htmlFiles = @(Get-ChildItem -Path $Root -Filter *.html -File)
$adminIndexPath = Join-Path $Root 'admin/index.html'

if (Test-Path $adminIndexPath) {
    $htmlFiles += Get-Item $adminIndexPath
}

if (-not $htmlFiles) {
    Write-Error 'No HTML files found to update.'
    exit 1
}

$replacements = @(
    @{ Pattern = '((?:\.\./)?)css/style\.css(?:\?v=\d+)?'; Replacement = "`$1css/style.css?v=$Version" },
    @{ Pattern = '((?:\.\./)?)js/site-data\.js(?:\?v=\d+)?'; Replacement = "`$1js/site-data.js?v=$Version" },
    @{ Pattern = '((?:\.\./)?)js/translations\.js(?:\?v=\d+)?'; Replacement = "`$1js/translations.js?v=$Version" },
    @{ Pattern = '((?:\.\./)?)js/main\.js(?:\?v=\d+)?'; Replacement = "`$1js/main.js?v=$Version" }
)

$updatedFiles = @()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $updated = $content

    foreach ($replacement in $replacements) {
        $updated = [System.Text.RegularExpressions.Regex]::Replace(
            $updated,
            $replacement.Pattern,
            $replacement.Replacement
        )
    }

    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $updated, $utf8NoBom)
        $updatedFiles += $file.Name
    }
}

Write-Host "Asset version updated to $Version"
if ($updatedFiles.Count -gt 0) {
    Write-Host ('Updated files: ' + ($updatedFiles -join ', '))
} else {
    Write-Host 'No files needed updating.'
}