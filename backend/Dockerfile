# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
