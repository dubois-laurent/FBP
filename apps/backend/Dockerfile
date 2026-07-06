FROM node:24-alpine
WORKDIR /app

# Activer corepack (pnpm natif, pas de npm install -g)
RUN corepack enable

# Copier les manifestes du monorepo (couche cachée séparément)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Installer uniquement les deps du backend
RUN pnpm install --filter backend --frozen-lockfile

# Copier le code source (surchargé par le volume en dev)
COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["sh", "-c", "pnpm db:migrate && pnpm dev"]
