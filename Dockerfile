# --- Build ---
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Build als Standalone
RUN npm run build

# --- Runtime ---
FROM node:24-alpine AS runner
WORKDIR /app

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
