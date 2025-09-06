# 🥨 Backschmiede Kölker - Website

Willkommen im Ofen unserer digitalen Backstube!  
Hier entsteht der frische Quellcode für [Backschmiede Kölker](https://backschmiede-koelker.de) - von Hand geknetet, mit Liebe gebacken und direkt heiß aus dem GitHub-Ofen serviert.  

---

## Getting Started

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
# Set ADMIN_PASSWORD in .env
npx prisma db seed
```
