FROM node:24-alpine
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --filter frontend --frozen-lockfile

COPY apps/frontend/ ./apps/frontend/

WORKDIR /app/apps/frontend
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
