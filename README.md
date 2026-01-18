# 🥨 Backschmiede Kölker - Website

Willkommen im Ofen unserer digitalen Backstube!  
Hier entsteht der frische Quellcode für [Backschmiede Kölker](https://backschmiede-koelker.de) - von Hand geknetet, mit Liebe gebacken und direkt heiß aus dem GitHub-Ofen serviert.  

---



## Getting Started


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

docker compose `
  --env-file ".\.env.local" `
  -f ".\compose.local.yml" `
  run --rm backschmiede-koelker_local sh -lc "[ -f .docker-npm.stamp ] || (npm ci --prefer-offline --no-audit --loglevel=warn && npx prisma generate && touch .docker-npm.stamp); npx prisma generate; npx prisma migrate dev"

docker compose --env-file ".\.env.local" -f ".\compose.local.yml" up

# if you have added new packages with "npm" or sth, then you have to delete the .docker-npm.stamp file and restart the website

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



### Start prod -> cicd or use:
```bash
docker compose --env-file .env.prod -f compose.yml up -d
```







# maybe obsolete:
First, run the development server:

```bash
# (only works if you set "output and images" in next.config.ts)

# first time:
docker volume create pg_local_data
docker run -d --name pg-local -p 5432:5432 -e POSTGRES_USER=backschmiede_koelker -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=backschmiede_koelker -v pg_local_data:/var/lib/postgresql/data postgres:16-alpine
docker exec -it pg-local psql -U backschmiede_koelker -d backschmiede_koelker -c "CREATE SCHEMA IF NOT EXISTS backschmiede_koelker AUTHORIZATION backschmiede_koelker;"
npx prisma migrate dev --name init

# restart
docker start pg-local
npx prisma migrate dev
docker compose -f docker-compose.cdn.local.yml up -d

npm run dev

# stop
docker compose -f docker-compose.cdn.local.yml down
docker stop pg-local
```

### Change IP to ur local IP (remeber to do it in .env aswell):
Open [http://192.168.178.163:3000](http://192.168.178.163:3000) with your browser to see the result.

## Deployment

Start Local-Website:

```bash
npm install

npm run build

npm start
```

Update Prod-Website:

merge changes into main -> github actions updates website

## How to change admin password:

```bash
# Set ADMIN_PASSWORD in .env.local
docker compose `
>>   --env-file ".\.env.local" `
>>   -f ".\compose.local.yml" `
>>   run --rm backschmiede-koelker_local sh -lc "npx prisma db seed"
```
