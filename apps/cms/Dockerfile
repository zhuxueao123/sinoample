FROM node:22-bookworm-slim AS base

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

EXPOSE 1337

CMD ["npm", "run", "start", "-w", "apps/cms"]
