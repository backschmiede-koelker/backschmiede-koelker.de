# --- Build ---
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Prisma Client generieren (braucht schema)
COPY prisma ./prisma
RUN npx prisma generate

# Quellcode
COPY . .

ARG NEXT_PUBLIC_BASE_ASSET_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_ASSET_URL=$NEXT_PUBLIC_BASE_ASSET_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Next build (standalone)
RUN npm run build

# --- Runtime ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next standalone + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: Schema + Engines + Client (für Query & Migrations)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Prisma CLI für 'prisma migrate deploy' im Container
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

EXPOSE 3000
CMD ["sh", "-c", "node server.js"]
