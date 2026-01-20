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
# ===============================
# BUMP APP VERSION (SOURCE UNIQUE)
# ===============================

$appPath = "js/app.js"
$swPath = "service-worker.js"
$placeholder = "__APP_VERSION__"

# --- APP VERSION ---
$appContent = Get-Content $appPath -Raw

if ($appContent -notmatch 'export const APP_VERSION = "(\d+)\.(\d+)\.(\d+)"') {
    Write-Error "APP_VERSION introuvable dans app.js"
    exit 1
}

$major = $matches[1]
$minor = $matches[2]
$patch = [int]$matches[3] + 1
$newVersion = "$major.$minor.$patch"

$appContent = $appContent -replace `
    'export const APP_VERSION = "\d+\.\d+\.\d+"', `
    "export const APP_VERSION = `"$newVersion`""

Set-Content $appPath $appContent
git add $appPath

Write-Host "APP_VERSION mise à jour -> $newVersion"

# --- SERVICE WORKER ---
$swContent = Get-Content $swPath -Raw

# 1. Vérifier la présence du placeholder DANS LE REPO
if ($swContent -notmatch $placeholder) {
    Write-Error "Le placeholder __APP_VERSION__ doit rester dans service-worker.js"
    exit 1
}

# 2. Injecter temporairement la version pour forcer l'update SW
$swInjected = $swContent -replace $placeholder, $newVersion
Set-Content $swPath $swInjected
git add $swPath

# 3. Commit du bump (le hook est en train de s’exécuter)

# 4. RESTAURATION IMMÉDIATE DU PLACEHOLDER
Set-Content $swPath $swContent
git add $swPath

Write-Host "CACHE_VERSION synchronisée via placeholder"
