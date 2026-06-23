# Sino Ample Website

English B2B vending machine website for Sino Ample.

## Structure

- `apps/web`: Next.js frontend.
- `apps/worker`: Cloudflare Worker API, D1 schema, inquiry handling.
- `apps/cms`: Strapi CMS for internal content management.
- `项目方案.md`: project plan and architecture notes.

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Start the Worker API:

```bash
npm run worker:dev
```

Start Strapi CMS:

```bash
eval "$(fnm env --shell zsh)"
fnm use v22.12.0
npm run cms:dev
```

Apply local D1 migrations:

```bash
npm run db:migrate:local -w apps/worker
```

Frontend local URL:

```text
http://127.0.0.1:3000
```

Worker local URL:

```text
http://localhost:8787
```

Strapi local URL:

```text
http://localhost:1337/admin
```

## Environment

Frontend example:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Worker secrets to configure before production:

```bash
wrangler secret put ZOHO_ACCESS_TOKEN
wrangler secret put ZOHO_CLIENT_ID
wrangler secret put ZOHO_CLIENT_SECRET
wrangler secret put ZOHO_REFRESH_TOKEN
wrangler secret put TURNSTILE_SECRET_KEY
```

Production Cloudflare values still need to be filled in `apps/worker/wrangler.toml`:

- D1 database ID
- Zoho account ID
- Admin API token
- Sync secret
- default sales email

CMS production values to configure on the company server:

- `DATABASE_CLIENT=postgres`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_SSL`
- `APP_KEYS`
- `ADMIN_JWT_SECRET`
- `API_TOKEN_SALT`
- `TRANSFER_TOKEN_SALT`
- `ENCRYPTION_KEY`
- `UPLOAD_PROVIDER=r2`
- `R2_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=sinoample-media`
- `R2_REGION=auto`
- `R2_PUBLIC_URL=https://media.sinoample.shop`
- `R2_ROOT_PATH=cms`
- `CLOUDFLARE_SYNC_URL=https://api.sinoample.shop`
- `CLOUDFLARE_SYNC_SECRET`

Docker deployment files are in `deploy/cms`. The intended internal server is `172.16.1.12`, with Strapi exposed as `https://admin.sinoample.shop` through Cloudflare Tunnel.

## Cloudflare Resources

Created resources:

- Pages project: `sinoample-web`
- Latest Pages preview: `https://5a2b3ed7.sinoample-web.pages.dev`
- Pages custom domain: `https://www.sinoample.shop`
- Worker: `sinoample-api`
- Worker URL: `https://sinoample-api.zhuxa-e8b.workers.dev`
- Worker custom domain: `https://api.sinoample.shop`
- D1 preview: `sinoample-preview`, `2770a7aa-42c0-461a-a18e-2dc9ac47c0a9`
- D1 production: `sinoample-prod`, `064cc0df-eca3-4a0e-9e22-1c4016a8b5eb`
- R2 bucket: `sinoample-media`
- R2 custom domain: `https://media.sinoample.shop`

DNS and Worker custom domains were configured manually in the Cloudflare dashboard because the API token did not include DNS records / Workers routes permissions.

## API Endpoints

Public content:

- `GET /api/product-categories`
- `GET /api/products`
- `GET /api/products/:categorySlug/:productSlug`
- `GET /api/solutions`
- `GET /api/blog-posts`
- `GET /api/blog-posts/:slug`
- `GET /api/faqs`
- `GET /api/site-settings`

Inquiry:

- `POST /api/inquiries`

Admin:

- `GET /api/admin/inquiries`
- `GET /api/admin/inquiries/:id`
- `PATCH /api/admin/inquiries/:id`
- `GET /api/admin/inquiries.csv`
- `POST /api/admin/inquiries/:id/resend`

Sync:

- `POST /api/sync/product-category`
- `POST /api/sync/product`
- `POST /api/sync/solution`
- `POST /api/sync/blog-category`
- `POST /api/sync/blog-post`
- `POST /api/sync/faq`
- `POST /api/sync/sales-region-rule`

Sync and admin endpoints require bearer tokens.

## Verification

Build frontend:

```bash
npm run build -w apps/web
```

Check Worker TypeScript:

```bash
npx tsc -p apps/worker/tsconfig.json
```

Create a local test inquiry:

```bash
curl -X POST http://localhost:8787/api/inquiries \
  -H 'content-type: application/json' \
  --data '{
    "name": "Test Buyer",
    "company": "Demo Co",
    "email": "buyer@example.com",
    "phone": "+1 555 0100",
    "country": "United States",
    "productName": "Combo Vending Machines",
    "quantity": "10 units",
    "message": "Please send quotation details.",
    "privacyAccepted": true
  }'
```

List local inquiries:

```bash
curl http://localhost:8787/api/admin/inquiries \
  -H 'authorization: Bearer replace-in-cloudflare-dashboard'
```
