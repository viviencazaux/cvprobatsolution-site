# Deploiement Cloudflare Tunnel - CV PRO BAT SOLUTION

Domaine :

- `cvprobatsolution.fr`
- `www.cvprobatsolution.fr`

Objectif : heberger le site sur le Raspberry Pi sans ouvrir les ports de la Bbox.

## Solution retenue

La solution recommandee est **Cloudflare Tunnel**.

Avantages :

- pas d'ouverture des ports 80/443 sur la Bbox ;
- pas besoin d'IP publique fixe ;
- fonctionne meme si Bouygues utilise du CGNAT ;
- HTTPS gere par Cloudflare ;
- le Raspberry n'est pas expose directement a Internet ;
- compatible avec `cvprobatsolution.fr` et `www.cvprobatsolution.fr`.

## Ce qui est prepare dans ce dossier

- `install-cloudflare-tunnel.sh` : installation Nginx + cloudflared + configuration locale du site.
- `nginx-cvprobatsolution.fr.conf` : configuration Nginx locale.
- `cloudflared-config.yml` : modele de configuration Cloudflare Tunnel.
- `sync-site.ps1` : script Windows pour envoyer le site vers le Raspberry.

## Etape 1 - Ajouter le domaine dans Cloudflare

1. Creer ou ouvrir ton compte Cloudflare.
2. Ajouter le site `cvprobatsolution.fr`.
3. Cloudflare va donner 2 nameservers, par exemple :

```text
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

4. Aller dans OVH > Domaine `cvprobatsolution.fr` > Serveurs DNS.
5. Remplacer les serveurs DNS OVH par ceux de Cloudflare.

Delai DNS possible : de quelques minutes a 24 heures.

## Etape 2 - Installer le serveur local sur Raspberry

Depuis ton PC, envoie ce dossier et le site vers le Raspberry.

Exemple avec l'IP Tailscale :

```powershell
scp -r index.html styles.css script.js assets deploy-raspberry pi@100.105.137.66:/home/pi/cvprobatsolution-deploy/
```

Si l'utilisateur Raspberry n'est pas `pi`, remplace `pi`.

Ensuite connecte-toi :

```powershell
ssh pi@100.105.137.66
```

Puis sur le Raspberry :

```bash
cd /home/pi/cvprobatsolution-deploy/deploy-raspberry
chmod +x install-cloudflare-tunnel.sh
./install-cloudflare-tunnel.sh
```

Le site sera servi localement par Nginx sur :

```text
http://localhost
```

## Etape 3 - Authentifier Cloudflare sur le Raspberry

Sur le Raspberry :

```bash
cloudflared tunnel login
```

La commande affiche un lien.

1. Ouvre ce lien dans ton navigateur.
2. Connecte-toi a Cloudflare.
3. Choisis le domaine `cvprobatsolution.fr`.
4. Valide l'autorisation.

## Etape 4 - Creer le tunnel

Sur le Raspberry :

```bash
cloudflared tunnel create cvprobatsolution
```

La commande affiche un UUID de tunnel, par exemple :

```text
Created tunnel cvprobatsolution with id 12345678-abcd-1234-abcd-123456789abc
```

Note cet UUID.

## Etape 5 - Installer la configuration du tunnel

Sur le Raspberry :

```bash
sudo mkdir -p /etc/cloudflared
sudo cp cloudflared-config.yml /etc/cloudflared/config.yml
```

Edite le fichier :

```bash
sudo nano /etc/cloudflared/config.yml
```

Remplace :

```text
REMPLACER_PAR_UUID_TUNNEL
REMPLACER_PAR_UUID_TUNNEL.json
```

par l'UUID reel du tunnel.

Si ton utilisateur Raspberry n'est pas `pi`, remplace aussi `/home/pi/` par le bon dossier utilisateur, par exemple
`/home/vivien/`.

Exemple :

```yaml
tunnel: 12345678-abcd-1234-abcd-123456789abc
credentials-file: /home/pi/.cloudflared/12345678-abcd-1234-abcd-123456789abc.json
```

## Etape 6 - Creer les DNS Cloudflare

Sur le Raspberry :

```bash
cloudflared tunnel route dns cvprobatsolution cvprobatsolution.fr
cloudflared tunnel route dns cvprobatsolution www.cvprobatsolution.fr
```

Ces commandes creent les entrees DNS Cloudflare vers le tunnel.

## Etape 7 - Installer le tunnel en service

Sur le Raspberry :

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
```

## Etape 8 - Tester

Depuis ton telephone en 4G/5G ou depuis un autre reseau :

```text
https://cvprobatsolution.fr
https://www.cvprobatsolution.fr
```

## Mettre a jour le site plus tard

Depuis ton PC :

```powershell
.\deploy-raspberry\sync-site.ps1 -RaspberryHost 100.105.137.66 -RaspberryUser pi
```

Puis sur le Raspberry, si besoin :

```bash
sudo systemctl reload nginx
```

## Verifications utiles

Sur le Raspberry :

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status cloudflared
cloudflared tunnel list
cloudflared tunnel info cvprobatsolution
```

Tester le site local du Raspberry :

```bash
curl -I http://localhost
```

Tester les domaines :

```bash
curl -I https://cvprobatsolution.fr
curl -I https://www.cvprobatsolution.fr
```
