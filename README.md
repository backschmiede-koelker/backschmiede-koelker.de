This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# (only works if you set "output and images" in next.config.ts)
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Deployment

Start Website:

```bash
npm install

npm run build

npm start
```




obsolete:
Build docker image:

```bash
# First Start Docker Desktop and set "output" to "standalone" in next.config.ts then:
docker build -t backschmiede-koelker .
# check build
docker images
# export image
docker save backschmiede-koelker -o backschmiede-koelker.tar
# upload image and docker-compose.yml
scp backschmiede-koelker.tar user@server:/var/www/backschmiede-koelker/
scp docker-compose.yml user@server-ip:/var/www/backschmiede-koelker/
# login to server
ssh user@server-ip
# import image on server
cd /var/www/backschmiede-koelker
docker compose down
docker image rm backschmiede-koelker
docker load -i backschmiede-koelker.tar
# check image
docker images
# start container
docker compose up -d
```
