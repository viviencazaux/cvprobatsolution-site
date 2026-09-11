param(
  [Parameter(Mandatory = $true)]
  [string]$RaspberryHost,

  [string]$RaspberryUser = "pi",
  [string]$RemotePath = "/var/www/cvprobatsolution.fr"
)

$ErrorActionPreference = "Stop"

$target = "${RaspberryUser}@${RaspberryHost}:${RemotePath}/"

scp -r "index.html" "mentions-legales.html" "politique-confidentialite.html" "styles.css" "script.js" "animations.js" "legal-config.js" "robots.txt" "sitemap.xml" "assets" $target

Write-Host "Site envoye vers $target"
