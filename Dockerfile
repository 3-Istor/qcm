FROM node:26-alpine3.22 AS base

RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Full node_modules from the deps stage (not a fresh `npm install prisma` here):
# prisma.config.ts does `import ... from "prisma/config"`, which Node resolves
# from ./node_modules, and the standalone output's pruned node_modules doesn't
# carry the prisma CLI or its transitive deps.
COPY --from=deps /app/node_modules ./node_modules
ENV PATH="/app/node_modules/.bin:${PATH}"

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
