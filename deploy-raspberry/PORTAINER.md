# Deploiement avec Portainer uniquement

Objectif : deployer le site `cvprobatsolution.fr` sur le Raspberry via Portainer, sans SSH, sans SCP, sans ouverture de ports Bbox.

Machine :

- Raspberry : `raspberrypi`
- Tailscale : `100.105.137.66`
- Domaine : `cvprobatsolution.fr`
- Sous-domaine : `www.cvprobatsolution.fr`

## Choix recommande

Utiliser **Portainer + GitHub + Cloudflare Tunnel**.

Raison : ton site contient beaucoup d'images. Un `docker-compose.yml` colle directement dans Portainer ne peut pas embarquer proprement tous les fichiers et images du site. Le plus fiable est donc :

1. mettre le site dans un depot GitHub ;
2. demander a Portainer de construire l'image depuis ce depot ;
3. exposer le site via Cloudflare Tunnel.

## Fichiers deja prepares

A la racine du projet :

- `Dockerfile`
- `.dockerignore`
- `docker/nginx-site.conf`
- `docker-compose.portainer.yml`
- `docker-compose.cloudflare.portainer.yml`

## Option A - Test local via Tailscale, sans Cloudflare

Cette option permet de verifier que le conteneur sert bien le site sur le Raspberry.

Dans Portainer :

1. Va dans **Stacks**.
2. Clique **Add stack**.
3. Nom : `cvprobatsolution-test`.
4. Choisis **Repository**.
5. Renseigne le depot GitHub contenant ce projet.
6. Dans **Compose path**, mets :

```text
docker-compose.portainer.yml
```

7. Clique **Deploy the stack**.

Quand le conteneur est lance, teste depuis un appareil connecte a Tailscale :

```text
http://100.105.137.66:8090
```

Si tu veux tester depuis le reseau local classique, il faut connaitre l'IP locale du Raspberry, mais ce n'est pas necessaire avec Tailscale.

## Option B - Production avec Cloudflare Tunnel

C'est l'option recommandee pour rendre le site accessible publiquement :

```text
https://cvprobatsolution.fr
https://www.cvprobatsolution.fr
```

### 1. Ajouter le domaine dans Cloudflare

Dans Cloudflare :

1. **Add a site**.
2. Domaine : `cvprobatsolution.fr`.
3. Cloudflare donne deux serveurs DNS.

Dans OVH :

1. Va dans le domaine `cvprobatsolution.fr`.
2. Ouvre **Serveurs DNS**.
3. Remplace les serveurs DNS OVH par ceux de Cloudflare.
4. Attends la propagation DNS.

### 2. Creer un tunnel dans Cloudflare

Dans Cloudflare :

1. Va dans **Zero Trust**.
2. Va dans **Networks** > **Tunnels**.
3. Clique **Create a tunnel**.
4. Type : **Cloudflared**.
5. Nom du tunnel :

```text
cvprobatsolution
```

6. Cloudflare affiche une commande avec un long token.
7. Copie uniquement le token, pas toute la commande.

Le token ressemble a une longue chaine de caracteres.

### 3. Ajouter les domaines publics au tunnel

Dans le tunnel Cloudflare :

Ajoute un premier **Public Hostname** :

```text
Subdomain : laisser vide
Domain    : cvprobatsolution.fr
Path      : laisser vide
Service   : http://cvprobatsolution:80
```

Ajoute un deuxieme **Public Hostname** :

```text
Subdomain : www
Domain    : cvprobatsolution.fr
Path      : laisser vide
Service   : http://cvprobatsolution:80
```

Important : `cvprobatsolution` est le nom du service Docker dans le compose.

### 4. Creer la stack Portainer production

Dans Portainer :

1. Va dans **Stacks**.
2. Clique **Add stack**.
3. Nom :

```text
cvprobatsolution
```

4. Choisis **Repository**.
5. Renseigne le depot GitHub contenant ce projet.
6. Dans **Compose path**, mets :

```text
docker-compose.cloudflare.portainer.yml
```

7. Dans **Environment variables**, ajoute :

```text
CLOUDFLARE_TUNNEL_TOKEN=TON_TOKEN_CLOUDFLARE
```

8. Clique **Deploy the stack**.

### 5. Verifier dans Portainer

Dans Portainer :

1. Va dans **Containers**.
2. Verifie que ces deux conteneurs sont `running` :

```text
cvprobatsolution-site
cvprobatsolution-cloudflared
```

3. Ouvre les logs de `cvprobatsolution-cloudflared`.

Il ne doit pas y avoir d'erreur de token ou de connexion.

### 6. Tester le site public

Teste :

```text
https://cvprobatsolution.fr
https://www.cvprobatsolution.fr
```

## Ce qu'il reste obligatoirement manuel

Ces actions ne peuvent pas etre faites par Codex sans acces a tes comptes :

1. Creer le depot GitHub ou me donner un depot existant.
2. Ajouter le domaine dans Cloudflare.
3. Remplacer les serveurs DNS chez OVH.
4. Creer le tunnel dans Cloudflare pour obtenir le token.
5. Coller le token dans Portainer.

## Compose complet si tu veux utiliser Web editor

Possible uniquement si l'image Docker existe deja dans un registre public/prive, par exemple :

```yaml
services:
  cvprobatsolution:
    image: ghcr.io/TON_COMPTE/cvprobatsolution-site:latest
    container_name: cvprobatsolution-site
    restart: unless-stopped
    expose:
      - "80"

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cvprobatsolution-cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - cvprobatsolution
```

Mais pour obtenir cette image, il faut d'abord publier le projet sur GitHub et construire l'image.

