#!/usr/bin/env bash
set -euo pipefail

SITE_DOMAIN="cvprobatsolution.fr"
SITE_ROOT="/var/www/${SITE_DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${SITE_DOMAIN}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Installation de Nginx et des dependances..."
sudo apt update
sudo apt install -y nginx curl gpg lsb-release rsync

echo "Installation de cloudflared..."
if ! command -v cloudflared >/dev/null 2>&1; then
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --yes --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list >/dev/null
  sudo apt update
  sudo apt install -y cloudflared
else
  echo "cloudflared est deja installe."
fi

echo "Creation du dossier du site..."
sudo mkdir -p "${SITE_ROOT}"
sudo rsync -av --delete \
  --exclude "deploy-raspberry" \
  --exclude ".git" \
  --exclude "access.log" \
  --exclude "node-server-*.log" \
  --exclude "server-*.log" \
  "${PROJECT_DIR}/" "${SITE_ROOT}/"

sudo chown -R www-data:www-data "${SITE_ROOT}"

echo "Installation de la configuration Nginx..."
sudo cp "${SCRIPT_DIR}/nginx-cvprobatsolution.fr.conf" "${NGINX_CONF}"
sudo ln -sfn "${NGINX_CONF}" "/etc/nginx/sites-enabled/${SITE_DOMAIN}"
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx

echo "Verification locale..."
curl -I http://localhost || true

echo ""
echo "Installation locale terminee."
echo "Etapes restantes :"
echo "1. cloudflared tunnel login"
echo "2. cloudflared tunnel create cvprobatsolution"
echo "3. sudo cp ${SCRIPT_DIR}/cloudflared-config.yml /etc/cloudflared/config.yml"
echo "4. Editer /etc/cloudflared/config.yml avec l'UUID du tunnel"
echo "5. cloudflared tunnel route dns cvprobatsolution cvprobatsolution.fr"
echo "6. cloudflared tunnel route dns cvprobatsolution www.cvprobatsolution.fr"
echo "7. sudo cloudflared service install && sudo systemctl restart cloudflared"
