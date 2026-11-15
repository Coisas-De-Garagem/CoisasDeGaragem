# Stage 1: Builder
FROM public.ecr.aws/docker/library/node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

# Stage 2: Production
FROM public.ecr.aws/docker/library/node:22-slim AS production
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

USER node

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
