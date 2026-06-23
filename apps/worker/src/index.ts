type Env = {
  DB: D1Database;
  ADMIN_API_TOKEN: string;
  SYNC_SECRET?: string;
  ZOHO_API_BASE_URL: string;
  ZOHO_ACCOUNTS_BASE_URL?: string;
  ZOHO_ACCOUNT_ID: string;
  ZOHO_FROM_EMAIL: string;
  DEFAULT_SALES_EMAIL: string;
  ZOHO_ACCESS_TOKEN?: string;
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type InquiryInput = {
  sourcePage?: string;
  sourceType?: string;
  productId?: number;
  productName?: string;
  solutionId?: number;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  quantity?: string;
  message?: string;
  privacyAccepted?: boolean;
  turnstileToken?: string;
};

type SalesRule = {
  sales_name: string;
  sales_email: string;
  cc_emails_json: string | null;
};

type SyncPayload = {
  records?: Record<string, unknown>[];
  record?: Record<string, unknown>;
  delete?: boolean;
  strapiId?: number;
  slug?: string;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type,authorization"
};

const publicCacheHeaders = {
  ...jsonHeaders,
  "cache-control": "public, s-maxage=300, stale-while-revalidate=600"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: jsonHeaders });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/api/inquiries") {
        return await createInquiry(request, env);
      }

      if (request.method === "GET" && url.pathname === "/api/product-categories") {
        return await listPublicRows(env, "product_categories", "is_active = 1", "sort_order ASC, name ASC");
      }

      if (request.method === "GET" && url.pathname === "/api/products") {
        return await listPublicRows(env, "products", "published_at IS NOT NULL", "sort_order ASC, name ASC");
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/products/")) {
        const [, , , categorySlug, productSlug] = url.pathname.split("/");
        return await getProduct(env, categorySlug, productSlug);
      }

      if (request.method === "GET" && url.pathname === "/api/solutions") {
        return await listPublicRows(env, "solutions", "published_at IS NOT NULL", "sort_order ASC, title ASC");
      }

      if (request.method === "GET" && url.pathname === "/api/blog-posts") {
        return await listPublicRows(env, "blog_posts", "published_at IS NOT NULL", "published_at DESC, title ASC");
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/blog-posts/")) {
        const slug = decodeURIComponent(url.pathname.split("/").pop() ?? "");
        return await getBySlug(env, "blog_posts", slug);
      }

      if (request.method === "GET" && url.pathname === "/api/faqs") {
        return await listPublicRows(env, "faqs", "is_active = 1", "sort_order ASC, question ASC");
      }

      if (request.method === "GET" && url.pathname === "/api/site-settings") {
        return await listPublicRows(env, "site_settings", "1 = 1", "key ASC");
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/sync/")) {
        assertSync(request, env);
        const entity = url.pathname.split("/").pop() ?? "";
        return await syncEntity(request, env, entity);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/inquiries") {
        assertAdmin(request, env);
        return await listInquiries(env);
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/admin/inquiries/")) {
        assertAdmin(request, env);
        const id = Number(url.pathname.split("/").pop());
        return await getInquiry(env, id);
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/inquiries/")) {
        assertAdmin(request, env);
        const id = Number(url.pathname.split("/").pop());
        return await updateInquiry(request, env, id);
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/admin/inquiries/") && url.pathname.endsWith("/resend")) {
        assertAdmin(request, env);
        const id = Number(url.pathname.split("/").at(-2));
        return await resendInquiryEmail(env, id);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/inquiries.csv") {
        assertAdmin(request, env);
        return await exportInquiriesCsv(env);
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return Response.json({ ok: true }, { headers: jsonHeaders });
      }

      return Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      const status = message === "Unauthorized" ? 401 : 500;
      return Response.json({ error: message }, { status, headers: jsonHeaders });
    }
  }
};

async function listPublicRows(env: Env, table: string, where: string, orderBy: string) {
  assertKnownTable(table);
  const rows = await env.DB.prepare(`SELECT * FROM ${table} WHERE ${where} ORDER BY ${orderBy}`).all();
  return Response.json({ data: rows.results ?? [] }, { headers: publicCacheHeaders });
}

async function getProduct(env: Env, categorySlug: string, productSlug: string) {
  const row = await env.DB.prepare(
    "SELECT * FROM products WHERE category_slug = ? AND slug = ? AND published_at IS NOT NULL LIMIT 1"
  )
    .bind(decodeURIComponent(categorySlug), decodeURIComponent(productSlug))
    .first();
  return row
    ? Response.json({ data: row }, { headers: publicCacheHeaders })
    : Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders });
}

async function getBySlug(env: Env, table: string, slug: string) {
  assertKnownTable(table);
  const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE slug = ? LIMIT 1`).bind(slug).first();
  return row
    ? Response.json({ data: row }, { headers: publicCacheHeaders })
    : Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders });
}

function assertKnownTable(table: string) {
  const allowed = new Set([
    "product_categories",
    "products",
    "solutions",
    "blog_categories",
    "blog_posts",
    "faqs",
    "site_settings",
    "sales_region_rules"
  ]);
  if (!allowed.has(table)) {
    throw new Error("Unknown table");
  }
}

async function createInquiry(request: Request, env: Env) {
  const input = (await request.json()) as InquiryInput;
  validateInquiry(input);

  if (env.TURNSTILE_SECRET_KEY && input.turnstileToken) {
    await verifyTurnstile(env, input.turnstileToken, request.headers.get("cf-connecting-ip"));
  }

  const now = new Date().toISOString();
  const inquiryNo = await nextInquiryNo(env, now);
  const salesRule = await matchSalesRule(env, input.country ?? "");
  const ipHash = await hashValue(request.headers.get("cf-connecting-ip") ?? "");

  await env.DB.prepare(
    `INSERT INTO inquiries (
      inquiry_no, source_page, source_type, product_id, product_name, solution_id,
      name, company, email, phone, whatsapp, country, quantity, message,
      privacy_accepted, status, assigned_to, assigned_sales_name, assigned_sales_email,
      email_status, ip_hash, user_agent, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, 'pending', ?, ?, ?, ?)`
  )
    .bind(
      inquiryNo,
      input.sourcePage ?? null,
      input.sourceType ?? null,
      input.productId ?? null,
      input.productName ?? null,
      input.solutionId ?? null,
      input.name,
      input.company ?? null,
      input.email,
      input.phone ?? null,
      input.whatsapp ?? null,
      input.country,
      input.quantity ?? null,
      input.message ?? null,
      1,
      salesRule?.sales_email ?? env.DEFAULT_SALES_EMAIL,
      salesRule?.sales_name ?? "Default Sales",
      salesRule?.sales_email ?? env.DEFAULT_SALES_EMAIL,
      ipHash,
      request.headers.get("user-agent") ?? null,
      now,
      now
    )
    .run();

  const inquiry = await env.DB.prepare("SELECT * FROM inquiries WHERE inquiry_no = ?")
    .bind(inquiryNo)
    .first<Record<string, unknown>>();

  await sendInquiryEmail(env, inquiry ?? {}, salesRule);

  return Response.json({ ok: true, inquiryNo }, { status: 201, headers: jsonHeaders });
}

async function syncEntity(request: Request, env: Env, entity: string) {
  const payload = (await request.json()) as SyncPayload;
  const records = payload.records ?? (payload.record ? [payload.record] : []);
  const now = new Date().toISOString();

  await writeSyncLog(env, "webhook", entity, payload.strapiId ? String(payload.strapiId) : null, "started", "Sync started", now);

  try {
    if (payload.delete) {
      await deleteEntity(env, entity, payload);
      await writeSyncLog(env, "webhook", entity, payload.strapiId ? String(payload.strapiId) : null, "success", "Deleted", now);
      return Response.json({ ok: true, deleted: true }, { headers: jsonHeaders });
    }

    let count = 0;
    for (const record of records) {
      await upsertEntity(env, entity, record);
      count += 1;
    }

    await writeSyncLog(env, "webhook", entity, null, "success", `Synced ${count} record(s)`, now);
    return Response.json({ ok: true, count }, { headers: jsonHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await writeSyncLog(env, "webhook", entity, payload.strapiId ? String(payload.strapiId) : null, "failed", message, now);
    throw error;
  }
}

async function upsertEntity(env: Env, entity: string, record: Record<string, unknown>) {
  const now = new Date().toISOString();
  const strapiId = num(record.strapi_id);

  switch (entity) {
    case "product-category":
      await env.DB.prepare(
        "UPDATE product_categories SET strapi_id = ? WHERE strapi_id IS NULL AND slug = ?"
      )
        .bind(strapiId, str(record.slug))
        .run();
      await env.DB.prepare(
        `INSERT INTO product_categories (strapi_id, name, slug, description, cover_image_url, sort_order, seo_title, seo_description, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET name=excluded.name, slug=excluded.slug, description=excluded.description, cover_image_url=excluded.cover_image_url, sort_order=excluded.sort_order, seo_title=excluded.seo_title, seo_description=excluded.seo_description, is_active=excluded.is_active, updated_at=excluded.updated_at`
      )
        .bind(strapiId, str(record.name), str(record.slug), nullable(record.description), nullable(record.cover_image_url), num(record.sort_order, 0), nullable(record.seo_title), nullable(record.seo_description), bool(record.is_active, true), now)
        .run();
      return;

    case "product":
      await env.DB.prepare(
        "UPDATE products SET strapi_id = ? WHERE strapi_id IS NULL AND category_slug = ? AND slug = ?"
      )
        .bind(strapiId, str(record.category_slug), str(record.slug))
        .run();
      await env.DB.prepare(
        `INSERT INTO products (strapi_id, category_id, category_slug, name, slug, model_number, delivery, minimum_order_quantity, supply_ability, country_of_origin, stock_time, source_site, source_url, short_description, overview, cover_image_url, gallery_json, video_url, key_features_json, specifications_json, payment_options_json, capacity, cooling_heating_system, dimensions, weight, power_supply, screen_options_json, network_options_json, custom_branding_options_json, recommended_solution_ids_json, is_featured, sort_order, seo_title, seo_description, og_image_url, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET category_id=excluded.category_id, category_slug=excluded.category_slug, name=excluded.name, slug=excluded.slug, model_number=excluded.model_number, delivery=excluded.delivery, minimum_order_quantity=excluded.minimum_order_quantity, supply_ability=excluded.supply_ability, country_of_origin=excluded.country_of_origin, stock_time=excluded.stock_time, source_site=excluded.source_site, source_url=excluded.source_url, short_description=excluded.short_description, overview=excluded.overview, cover_image_url=excluded.cover_image_url, gallery_json=excluded.gallery_json, video_url=excluded.video_url, key_features_json=excluded.key_features_json, specifications_json=excluded.specifications_json, payment_options_json=excluded.payment_options_json, capacity=excluded.capacity, cooling_heating_system=excluded.cooling_heating_system, dimensions=excluded.dimensions, weight=excluded.weight, power_supply=excluded.power_supply, screen_options_json=excluded.screen_options_json, network_options_json=excluded.network_options_json, custom_branding_options_json=excluded.custom_branding_options_json, recommended_solution_ids_json=excluded.recommended_solution_ids_json, is_featured=excluded.is_featured, sort_order=excluded.sort_order, seo_title=excluded.seo_title, seo_description=excluded.seo_description, og_image_url=excluded.og_image_url, published_at=excluded.published_at, updated_at=excluded.updated_at`
      )
        .bind(strapiId, nullableNum(record.category_id), str(record.category_slug), str(record.name), str(record.slug), nullable(record.model_number), nullable(record.delivery), nullable(record.minimum_order_quantity), nullable(record.supply_ability), nullable(record.country_of_origin), nullable(record.stock_time), nullable(record.source_site), nullable(record.source_url), nullable(record.short_description), nullable(record.overview), nullable(record.cover_image_url), json(record.gallery_json ?? record.gallery), nullable(record.video_url), json(record.key_features_json ?? record.key_features), json(record.specifications_json ?? record.specifications), json(record.payment_options_json ?? record.payment_options), nullable(record.capacity), nullable(record.cooling_heating_system), nullable(record.dimensions), nullable(record.weight), nullable(record.power_supply), json(record.screen_options_json ?? record.screen_options), json(record.network_options_json ?? record.network_options), json(record.custom_branding_options_json ?? record.custom_branding_options), json(record.recommended_solution_ids_json ?? record.recommended_solution_ids), bool(record.is_featured), num(record.sort_order, 0), nullable(record.seo_title), nullable(record.seo_description), nullable(record.og_image_url), nullable(record.published_at), now)
        .run();
      return;

    case "solution":
      await env.DB.prepare(
        `INSERT INTO solutions (strapi_id, title, slug, short_description, overview, cover_image_url, pain_points_json, recommended_product_ids_json, deployment_notes, payment_and_management_notes, business_model_notes, cta_title, cta_description, sort_order, seo_title, seo_description, og_image_url, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET title=excluded.title, slug=excluded.slug, short_description=excluded.short_description, overview=excluded.overview, cover_image_url=excluded.cover_image_url, pain_points_json=excluded.pain_points_json, recommended_product_ids_json=excluded.recommended_product_ids_json, deployment_notes=excluded.deployment_notes, payment_and_management_notes=excluded.payment_and_management_notes, business_model_notes=excluded.business_model_notes, cta_title=excluded.cta_title, cta_description=excluded.cta_description, sort_order=excluded.sort_order, seo_title=excluded.seo_title, seo_description=excluded.seo_description, og_image_url=excluded.og_image_url, published_at=excluded.published_at, updated_at=excluded.updated_at`
      )
        .bind(num(record.strapi_id), str(record.title), str(record.slug), nullable(record.short_description), nullable(record.overview), nullable(record.cover_image_url), json(record.pain_points_json ?? record.pain_points), json(record.recommended_product_ids_json ?? record.recommended_product_ids), nullable(record.deployment_notes), nullable(record.payment_and_management_notes), nullable(record.business_model_notes), nullable(record.cta_title), nullable(record.cta_description), num(record.sort_order, 0), nullable(record.seo_title), nullable(record.seo_description), nullable(record.og_image_url), nullable(record.published_at), now)
        .run();
      return;

    case "blog-category":
      await env.DB.prepare(
        `INSERT INTO blog_categories (strapi_id, name, slug, description, sort_order, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET name=excluded.name, slug=excluded.slug, description=excluded.description, sort_order=excluded.sort_order, is_active=excluded.is_active, updated_at=excluded.updated_at`
      )
        .bind(num(record.strapi_id), str(record.name), str(record.slug), nullable(record.description), num(record.sort_order, 0), bool(record.is_active, true), now)
        .run();
      return;

    case "blog-post":
      await env.DB.prepare(
        `INSERT INTO blog_posts (strapi_id, category_id, category_slug, title, slug, tags_json, cover_image_url, excerpt, content, author_name, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET category_id=excluded.category_id, category_slug=excluded.category_slug, title=excluded.title, slug=excluded.slug, tags_json=excluded.tags_json, cover_image_url=excluded.cover_image_url, excerpt=excluded.excerpt, content=excluded.content, author_name=excluded.author_name, published_at=excluded.published_at, reading_time=excluded.reading_time, is_featured=excluded.is_featured, seo_title=excluded.seo_title, seo_description=excluded.seo_description, og_image_url=excluded.og_image_url, updated_at=excluded.updated_at`
      )
        .bind(num(record.strapi_id), nullableNum(record.category_id), nullable(record.category_slug), str(record.title), str(record.slug), json(record.tags_json ?? record.tags), nullable(record.cover_image_url), nullable(record.excerpt), nullable(record.content), nullable(record.author_name), nullable(record.published_at), nullableNum(record.reading_time), bool(record.is_featured), nullable(record.seo_title), nullable(record.seo_description), nullable(record.og_image_url), now)
        .run();
      return;

    case "faq":
      await env.DB.prepare(
        `INSERT INTO faqs (strapi_id, question, answer, category, sort_order, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET question=excluded.question, answer=excluded.answer, category=excluded.category, sort_order=excluded.sort_order, is_active=excluded.is_active, updated_at=excluded.updated_at`
      )
        .bind(num(record.strapi_id), str(record.question), str(record.answer), nullable(record.category), num(record.sort_order, 0), bool(record.is_active, true), now)
        .run();
      return;

    case "site-setting":
      await env.DB.prepare(
        `INSERT INTO site_settings (key, value_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at`
      )
        .bind("global", json(record), now)
        .run();
      return;

    case "sales-region-rule":
      await env.DB.prepare(
        `INSERT INTO sales_region_rules (strapi_id, region_name, countries_json, sales_name, sales_email, cc_emails_json, is_default, is_active, sort_order, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(strapi_id) DO UPDATE SET region_name=excluded.region_name, countries_json=excluded.countries_json, sales_name=excluded.sales_name, sales_email=excluded.sales_email, cc_emails_json=excluded.cc_emails_json, is_default=excluded.is_default, is_active=excluded.is_active, sort_order=excluded.sort_order, updated_at=excluded.updated_at`
      )
        .bind(num(record.strapi_id), str(record.region_name), json(record.countries_json ?? record.countries), str(record.sales_name), str(record.sales_email), json(record.cc_emails_json ?? record.cc_emails), bool(record.is_default), bool(record.is_active, true), num(record.sort_order, 0), now)
        .run();
      return;

    default:
      throw new Error(`Unsupported sync entity: ${entity}`);
  }
}

async function deleteEntity(env: Env, entity: string, payload: SyncPayload) {
  if (entity === "site-setting") {
    await env.DB.prepare("DELETE FROM site_settings WHERE key = ?").bind("global").run();
    return;
  }

  const tableByEntity: Record<string, string> = {
    "product-category": "product_categories",
    product: "products",
    solution: "solutions",
    "blog-category": "blog_categories",
    "blog-post": "blog_posts",
    faq: "faqs",
    "site-setting": "site_settings",
    "sales-region-rule": "sales_region_rules"
  };
  const table = tableByEntity[entity];
  if (!table) throw new Error(`Unsupported sync entity: ${entity}`);

  if (payload.strapiId) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE strapi_id = ?`).bind(payload.strapiId).run();
    return;
  }
  if (payload.slug) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE slug = ?`).bind(payload.slug).run();
    return;
  }
  throw new Error("Delete sync requires strapiId or slug");
}

async function writeSyncLog(env: Env, syncType: string, entityType: string, entityId: string | null, status: string, message: string, startedAt: string) {
  await env.DB.prepare(
    "INSERT INTO sync_logs (sync_type, entity_type, entity_id, status, message, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(syncType, entityType, entityId, status, message, startedAt, new Date().toISOString())
    .run();
}

function validateInquiry(input: InquiryInput) {
  const required = [input.name, input.email, input.country];
  if (required.some((value) => !value || String(value).trim().length < 2)) {
    throw new Error("Missing required inquiry fields");
  }

  if (!input.email?.includes("@")) {
    throw new Error("Invalid email address");
  }

  if (!input.privacyAccepted) {
    throw new Error("Privacy policy acceptance is required");
  }
}

async function verifyTurnstile(env: Env, token: string, remoteIp: string | null) {
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY ?? "");
  form.set("response", token);
  if (remoteIp) {
    form.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  const result = (await response.json()) as { success?: boolean };

  if (!result.success) {
    throw new Error("Turnstile verification failed");
  }
}

async function nextInquiryNo(env: Env, now: string) {
  const date = now.slice(0, 10).replaceAll("-", "");
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE inquiry_no LIKE ?")
    .bind(`INQ-${date}-%`)
    .first<{ count: number }>();
  const next = String((row?.count ?? 0) + 1).padStart(4, "0");
  return `INQ-${date}-${next}`;
}

async function matchSalesRule(env: Env, country: string) {
  const rows = await env.DB.prepare(
    "SELECT sales_name, sales_email, cc_emails_json, countries_json FROM sales_region_rules WHERE is_active = 1 ORDER BY is_default ASC, sort_order ASC"
  ).all<SalesRule & { countries_json: string }>();

  for (const rule of rows.results ?? []) {
    const countries = safeJson<string[]>(rule.countries_json, []);
    if (countries.map((item) => item.toLowerCase()).includes(country.toLowerCase())) {
      return rule;
    }
  }

  const defaultRule = await env.DB.prepare(
    "SELECT sales_name, sales_email, cc_emails_json FROM sales_region_rules WHERE is_active = 1 AND is_default = 1 LIMIT 1"
  ).first<SalesRule>();

  return defaultRule;
}

async function sendInquiryEmail(env: Env, inquiry: Record<string, unknown>, salesRule: SalesRule | null) {
  const toEmail = salesRule?.sales_email ?? env.DEFAULT_SALES_EMAIL;
  const accessToken = await getZohoAccessToken(env);

  if (!accessToken) {
    await markEmailSkipped(env, inquiry.id as number, "Zoho OAuth credentials are not configured");
    return;
  }

  const subject = `New vending machine inquiry: ${inquiry.inquiry_no}`;
  const content = [
    `<h2>${subject}</h2>`,
    `<p><strong>Name:</strong> ${escapeHtml(String(inquiry.name ?? ""))}</p>`,
    `<p><strong>Company:</strong> ${escapeHtml(String(inquiry.company ?? ""))}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(String(inquiry.email ?? ""))}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(String(inquiry.phone ?? ""))}</p>`,
    `<p><strong>Country:</strong> ${escapeHtml(String(inquiry.country ?? ""))}</p>`,
    `<p><strong>Product:</strong> ${escapeHtml(String(inquiry.product_name ?? ""))}</p>`,
    `<p><strong>Quantity:</strong> ${escapeHtml(String(inquiry.quantity ?? ""))}</p>`,
    `<p><strong>Message:</strong><br>${escapeHtml(String(inquiry.message ?? "")).replaceAll("\n", "<br>")}</p>`
  ].join("");

  const response = await fetch(
    `${env.ZOHO_API_BASE_URL}/api/accounts/${env.ZOHO_ACCOUNT_ID}/messages`,
    {
      method: "POST",
      headers: {
        authorization: `Zoho-oauthtoken ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        fromAddress: env.ZOHO_FROM_EMAIL,
        toAddress: toEmail,
        subject,
        content,
        mailFormat: "html"
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    await markEmailFailed(env, inquiry.id as number, error);
    return;
  }

  const result = (await response.json()) as { data?: { messageId?: string } };
  await env.DB.prepare(
    "UPDATE inquiries SET email_status = 'sent', email_sent_at = ?, zoho_message_id = ?, updated_at = ? WHERE id = ?"
  )
    .bind(new Date().toISOString(), result.data?.messageId ?? null, new Date().toISOString(), inquiry.id)
    .run();
}

async function getZohoAccessToken(env: Env) {
  if (
    env.ZOHO_REFRESH_TOKEN &&
    env.ZOHO_CLIENT_ID &&
    env.ZOHO_CLIENT_SECRET &&
    !env.ZOHO_REFRESH_TOKEN.startsWith("replace")
  ) {
    const accountsBaseUrl = env.ZOHO_ACCOUNTS_BASE_URL ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      refresh_token: env.ZOHO_REFRESH_TOKEN,
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token"
    });

    const response = await fetch(`${accountsBaseUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as { access_token?: string };
    return result.access_token ?? null;
  }

  if (env.ZOHO_ACCESS_TOKEN && !env.ZOHO_ACCESS_TOKEN.startsWith("replace")) {
    return env.ZOHO_ACCESS_TOKEN;
  }

  return null;
}

async function markEmailSkipped(env: Env, id: number, message: string) {
  await env.DB.prepare(
    "UPDATE inquiries SET email_status = 'skipped', email_error = ?, updated_at = ? WHERE id = ?"
  )
    .bind(message, new Date().toISOString(), id)
    .run();
}

async function markEmailFailed(env: Env, id: number, message: string) {
  await env.DB.prepare(
    "UPDATE inquiries SET email_status = 'failed', email_error = ?, updated_at = ? WHERE id = ?"
  )
    .bind(message.slice(0, 1000), new Date().toISOString(), id)
    .run();
}

async function listInquiries(env: Env) {
  const rows = await env.DB.prepare(
    "SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 100"
  ).all();
  return Response.json({ data: rows.results ?? [] }, { headers: jsonHeaders });
}

async function getInquiry(env: Env, id: number) {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid inquiry id");
  }
  const row = await env.DB.prepare("SELECT * FROM inquiries WHERE id = ? LIMIT 1").bind(id).first();
  return row
    ? Response.json({ data: row }, { headers: jsonHeaders })
    : Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders });
}

async function updateInquiry(request: Request, env: Env, id: number) {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid inquiry id");
  }

  const input = (await request.json()) as {
    status?: string;
    salesNote?: string;
    assignedTo?: string;
  };
  const now = new Date().toISOString();

  await env.DB.prepare(
    "UPDATE inquiries SET status = COALESCE(?, status), sales_note = COALESCE(?, sales_note), assigned_to = COALESCE(?, assigned_to), updated_at = ? WHERE id = ?"
  )
    .bind(input.status ?? null, input.salesNote ?? null, input.assignedTo ?? null, now, id)
    .run();

  return Response.json({ ok: true }, { headers: jsonHeaders });
}

async function resendInquiryEmail(env: Env, id: number) {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid inquiry id");
  }
  const inquiry = await env.DB.prepare("SELECT * FROM inquiries WHERE id = ? LIMIT 1")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!inquiry) {
    return Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders });
  }
  const salesRule: SalesRule = {
    sales_name: String(inquiry.assigned_sales_name ?? "Assigned Sales"),
    sales_email: String(inquiry.assigned_sales_email ?? inquiry.assigned_to ?? env.DEFAULT_SALES_EMAIL),
    cc_emails_json: null
  };
  await sendInquiryEmail(env, inquiry, salesRule);
  return Response.json({ ok: true }, { headers: jsonHeaders });
}

async function exportInquiriesCsv(env: Env) {
  const rows = await env.DB.prepare("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5000").all<Record<string, unknown>>();
  const headers = [
    "inquiry_no",
    "created_at",
    "status",
    "assigned_sales_email",
    "name",
    "company",
    "email",
    "phone",
    "whatsapp",
    "country",
    "product_name",
    "quantity",
    "message",
    "email_status"
  ];
  const csv = [
    headers.join(","),
    ...(rows.results ?? []).map((row) => headers.map((key) => csvCell(row[key])).join(","))
  ].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=inquiries.csv",
      "access-control-allow-origin": "*"
    }
  });
}

function assertAdmin(request: Request, env: Env) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_API_TOKEN) {
    throw new Error("Unauthorized");
  }
}

function assertSync(request: Request, env: Env) {
  const expected = env.SYNC_SECRET || env.ADMIN_API_TOKEN;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== expected) {
    throw new Error("Unauthorized");
  }
}

function str(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error("Required string is missing");
  return text;
}

function nullable(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function num(value: unknown, fallback?: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) throw new Error("Invalid number");
  return parsed;
}

function nullableNum(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(value: unknown, fallback = false) {
  if (value === null || value === undefined || value === "") return fallback ? 1 : 0;
  return value === true || value === 1 || value === "1" || value === "true" ? 1 : 0;
}

function json(value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? []);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

async function hashValue(value: string) {
  if (!value) {
    return null;
  }
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
