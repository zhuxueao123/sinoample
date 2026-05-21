# Strapi CMS Deployment

This compose stack runs Strapi and PostgreSQL on the internal server.

## Files

- `docker-compose.yml`: Strapi + PostgreSQL services.
- `.env.example`: copy to `.env` on the server and fill secrets.

## Required Server Access

Deployment to `172.16.1.12` requires an SSH username and either password access or an SSH key installed for this machine.

## Public Access

Expose `admin.sinoample.shop` through Cloudflare Tunnel to `http://strapi:1337` if `cloudflared` runs in the same Docker network, or to `http://172.16.1.12:1337` if the tunnel runs on the host.

Tunnel setup is intentionally not included in this compose file because it needs the Cloudflare tunnel token from the account dashboard.

## Start

```bash
docker compose --env-file .env -f deploy/cms/docker-compose.yml up -d --build
```
