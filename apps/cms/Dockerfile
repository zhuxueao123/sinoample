FROM node:22-bookworm-slim AS builder

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 pkg-config \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/cms/package.json apps/cms/package.json

RUN npm ci --workspace apps/cms --include-workspace-root=false

COPY apps/cms apps/cms

RUN npm run build -w apps/cms
RUN npm prune --workspace apps/cms --include-workspace-root=false --omit=dev \
  && npm cache clean --force

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY apps/cms/tsconfig.json apps/cms/tsconfig.json
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/cms/database apps/cms/database
COPY --from=builder /app/apps/cms/dist apps/cms/dist
COPY --from=builder /app/apps/cms/public apps/cms/public
COPY --from=builder /app/apps/cms/src apps/cms/src
COPY --from=builder /app/apps/cms/package.json apps/cms/package.json

EXPOSE 1337

CMD ["npm", "run", "start", "-w", "apps/cms"]
