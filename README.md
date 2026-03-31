# 🥨 Backschmiede Kölker - Website

Willkommen im Ofen unserer digitalen Backstube!  
Hier entsteht der frische Quellcode für [Backschmiede Kölker](https://backschmiede-koelker.de) - von Hand geknetet, mit Liebe gebacken und direkt heiß aus dem GitHub-Ofen serviert.  

---

## Getting Started

### Start localhost (self-contained):

Starte direkt lokal mit localhost!

1. EINMALIG: Neue lokale Env-Datei anlegen und Variablen setzen:
```bash
Copy-Item .\.env.localhost.example .\.env.localhost
```
2. Self-contained Stack starten:
```bash
docker compose `
  --env-file ".\.env.localhost" `
  -f ".\compose.localhost.yml" `
  up
```
3. Website öffnen:
```bash
http://localhost:3000
```

Hinweise:
- Für die localhost-Variante sollte `UPLOAD_DIR` in `.env.localhost` auf `/uploads_localhost` zeigen.
- `compose.localhost.yml` mountet dafür den Repo-Ordner `./uploads_localhost` in den Container.
- Die öffentliche URL bleibt im localhost-Fall trotzdem `/uploads/...`; `UPLOAD_DIR` steuert nur den Speicherort auf dem Dateisystem.


### Stop localhost (self-contained):

```bash
docker compose `
  --env-file ".\.env.localhost" `
  -f ".\compose.localhost.yml" `
  down
```



### Start local:

1. Connect with VPN -> even if already in Network, you need the VPN IP!!!

2. Start traefik_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\traefik\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\traefik\compose.local.yml" `
  up -d
```
3. Start postgres_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\postgresql\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\postgresql\compose.local.yml" `
  up -d
```
4. Start cdn_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\cdn\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\cdn\compose.local.yml" `
  up -d
```
5. Start redis:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\redis\.env.prod" `
  -f "C:\Repository\ServerSoftware\webserver-02\redis\compose.yml" `
  up -d
```
6. Start backschmiede-koelker_local:
```bash
# prisma generate for VS Code:
npx dotenv -e .env.local -- prisma generate

# delete .docker-npm.stamp and start command for new packages:
docker compose `
  --env-file ".\.env.local" `
  -f ".\compose.local.yml" `
  run --rm backschmiede-koelker_local sh -lc "[ -f .docker-npm.stamp ] || (npm ci --prefer-offline --no-audit --loglevel=warn && npx prisma generate && touch .docker-npm.stamp); npx prisma generate; npx prisma migrate dev"

# start website:
docker compose --env-file ".\.env.local" -f ".\compose.local.yml" up

# On Err "network not found":
docker compose --env-file .\.env.local -f .\compose.local.yml up --force-recreate

# Build inside container:
docker compose --env-file ".\.env.local" -f compose.local.yml exec -e NODE_ENV=production backschmiede-koelker_local sh -lc 'npm run build'
# Build outside container:
npm run build:no-db
```


### Stop local:

1. Stop backschmiede-koelker_local:
Strg + C 
oder
```bash
docker compose `
  --env-file ".\.env.local" `
  -f ".\compose.local.yml" `
  down
```
2. Stop redis:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\redis\.env.prod" `
  -f "C:\Repository\ServerSoftware\webserver-02\redis\compose.yml" `
  down
```
3. Stop cdn_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\cdn\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\cdn\compose.local.yml" `
  down
```
4. Stop postgres_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\postgresql\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\postgresql\compose.local.yml" `
  down
```
5. Stop traefik_local:
```bash
docker compose `
  --env-file "C:\Repository\ServerSoftware\webserver-02\traefik\.env.local" `
  -f "C:\Repository\ServerSoftware\webserver-02\traefik\compose.local.yml" `
  down
```
6. Disconnect VPN



### Start prod services with:
```bash
docker compose --env-file .env.prod -f compose.yml up -d
```

### Start prod website with cicd:
Merge changes into main, GitHub Actions will update the site.



## How to change admin password:

Set ADMIN_USERNAME and ADMIN_PASSWORD in .env and start
