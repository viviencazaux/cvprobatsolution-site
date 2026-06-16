param(
  [Parameter(Mandatory = $true)]
  [string]$RaspberryHost,

  [string]$RaspberryUser = "pi",
  [string]$RemotePath = "/var/www/cvprobatsolution.fr"
)

$ErrorActionPreference = "Stop"

$target = "${RaspberryUser}@${RaspberryHost}:${RemotePath}/"

scp -r "index.html" "styles.css" "script.js" "assets" $target

Write-Host "Site envoye vers $target"
