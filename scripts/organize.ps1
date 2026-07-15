# Organize project files: create canonical folders, move files, update HTML links
# Run this script from the project root: `powershell -ExecutionPolicy Bypass -File scripts\organize.ps1`
Set-StrictMode -Version Latest
$root = Get-Location
Write-Host "Project root: $root"
$dirs = @(
    "assets\images",
    "assets\docs",
    "assets\css",
    "projects\zabbix\assets",
    "projects\bandit\assets",
    "projects",
    "scripts",
    "archives"
)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null; Write-Host "Created: $d" }
}

function SafeMove($src, $dst) {
    if (Test-Path $src) {
        $dstDir = Split-Path -Path $dst -Parent
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }
        Move-Item -Path $src -Destination $dst -Force -ErrorAction SilentlyContinue
        Write-Host "Moved: $src -> $dst"
    }
}

function Replace-InFile($file, $pattern, $replacement) {
    if (Test-Path $file) {
        (Get-Content $file -Raw) -replace $pattern, $replacement | Set-Content $file
        Write-Host ("Replaced in {0}: {1} -> {2}" -f $file, $pattern, $replacement)
    }
}

# Move images
SafeMove "photo.png" "assets\images\photo.png"
# Move project-specific assets
if (Test-Path "assets\zabbix") {
    SafeMove "assets\zabbix" "projects\zabbix\assets"
}

# Move project pages
SafeMove "zabbix.html" "projects\zabbix\index.html"
SafeMove "bandit.html" "projects\bandit\index.html"

# Move project css to assets/css
SafeMove "zabbix.css" "assets\css\zabbix.css"
SafeMove "bandit.css" "assets\css\bandit.css"

# Move docs to assets/docs
$docs = @("CV_Brice_Almeras.pdf", "DOC_TECHNIQUE_BRICE_ALMERAS.pdf", "PROJET_SIO_BRICE_ALMERAS.docx", "BRICE ALMERAS 8-1 - BTS SIO - 2025 - Annexe 8-1 - Epreuve E5 - Tableau de synthèse.pdf", "Rapport bandit.pdf")
foreach ($doc in $docs) { SafeMove $doc (Join-Path "assets\docs" (Split-Path $doc -Leaf)) }

# Update index.html links
Replace-InFile "index.html" "photo.png" "assets/images/photo.png"
Replace-InFile "index.html" "zabbix.html" "projects/zabbix/index.html"
Replace-InFile "index.html" "bandit.html" "projects/bandit/index.html"

# Update moved project pages (fix relative paths)
# For zabbix
$zabbixPage = "projects\zabbix\index.html"
Replace-InFile $zabbixPage "href=\"style.css\"" "href=\"../../style.css\""
Replace-InFile $zabbixPage "href=\"zabbix.css\"" "href=\"../../assets/css/zabbix.css\""
Replace-InFile $zabbixPage "src=\"assets/zabbix/" "src=\"assets/"

# For bandit
$banditPage = "projects\bandit\index.html"
Replace-InFile $banditPage "href=\"style.css\"" "href=\"../../style.css\""
Replace-InFile $banditPage "href=\"bandit.css\"" "href=\"../../assets/css/bandit.css\""
Replace-InFile $banditPage "src=\"assets/bandit/" "src=\"assets/"

# If any moved HTML still references root-level css names, also replace plain references
Replace-InFile $zabbixPage "zabbix.css" "assets/css/zabbix.css"
Replace-InFile $banditPage "bandit.css" "assets/css/bandit.css"

# Final listing of important folders
Write-Host "\nStructure summary:"
Get-ChildItem -Path assets -Recurse -Force | Select-Object FullName
Write-Host "\nProjects:"
Get-ChildItem -Path projects -Recurse -Force | Select-Object FullName

Write-Host "Organization complete. Please check the site locally to verify links and images."
