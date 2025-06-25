FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY client/vite.config.js ./client/
COPY client/svelte.config.js ./client/
COPY client/src ./client/src
COPY client/public ./client/public
COPY client/index.html ./client/index.html

RUN pnpm install --filter client
RUN pnpm --filter client build

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app

COPY package.json ./
COPY client/package.json ./client/
RUN pnpm install --filter client
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 80
CMD ["pnpm", "--filter", "client", "run", "start"]