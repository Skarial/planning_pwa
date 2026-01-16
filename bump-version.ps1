$path = "js/app.js"

$content = Get-Content $path -Raw

if ($content -notmatch 'export const APP_VERSION = "(\d+)\.(\d+)\.(\d+)"') {
    Write-Error "APP_VERSION introuvable dans app.js"
    exit 1
}

$major = $matches[1]
$minor = $matches[2]
$patch = [int]$matches[3] + 1

$newVersion = "$major.$minor.$patch"

$content = $content -replace `
    'export const APP_VERSION = "\d+\.\d+\.\d+"', `
    "export const APP_VERSION = `"$newVersion`""

Set-Content $path $content

Write-Host "APP_VERSION mise à jour → $newVersion"
