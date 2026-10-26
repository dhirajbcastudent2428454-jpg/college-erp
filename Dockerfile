FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile=false
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "backend/src/server.js"]
