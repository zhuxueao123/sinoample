/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { createStrapi } = require("@strapi/strapi");

const categoryUid = "api::product-category.product-category";
const productUid = "api::product.product";

function normalizeSpec(spec) {
  if (Array.isArray(spec)) return spec;
  if (spec && typeof spec === "object") return [spec.label ?? spec.name ?? "", spec.value ?? ""];
  return ["", String(spec ?? "")];
}

async function upsertCategory(strapi, category, sortOrder) {
  const existing = await strapi.documents(categoryUid).findFirst({
    filters: { slug: category.slug }
  });

  const data = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    sort_order: existing?.sort_order ?? sortOrder,
    is_active: true,
    seo_title: category.name,
    seo_description: category.description ?? null
  };

  if (!existing) {
    return await strapi.documents(categoryUid).create({
      data,
      status: "published"
    });
  }

  return await strapi.documents(categoryUid).update({
    documentId: existing.documentId,
    data,
    status: "published"
  });
}

async function upsertProduct(strapi, product, categoryDocId, sortOrder) {
  const existing = await strapi.documents(productUid).findFirst({
    filters: { slug: product.slug }
  });

  const specifications = (product.specifications ?? [])
    .map(normalizeSpec)
    .filter(([label, value]) => label || value)
    .filter(([label]) => {
      const key = String(label || "").trim().toLowerCase();
      return key !== "source site" && key !== "source url";
    });

  const data = {
    name: product.name,
    slug: product.slug,
    category: categoryDocId,
    model_number: product.modelNumber ?? null,
    delivery: product.delivery ?? null,
    minimum_order_quantity: product.minimumOrderQuantity ?? null,
    supply_ability: product.supplyAbility ?? null,
    country_of_origin: product.countryOfOrigin ?? null,
    stock_time: product.stockTime ?? null,
    source_site: product.sourceSite ?? null,
    source_url: product.sourceUrl ?? null,
    short_description: product.shortDescription ?? null,
    overview: product.overview ?? product.shortDescription ?? null,
    video_url: product.videoUrl ?? null,
    key_features: product.keyFeatures ?? [],
    specifications,
    is_featured: existing?.is_featured ?? false,
    sort_order: existing?.sort_order ?? sortOrder,
    seo_title: product.seoTitle ?? product.name,
    seo_description: product.seoDescription ?? product.shortDescription ?? null
  };

  if (!existing) {
    await strapi.documents(productUid).create({
      data,
      status: "published"
    });
    return "created";
  }

  await strapi.documents(productUid).update({
    documentId: existing.documentId,
    data,
    status: "published"
  });
  return "updated";
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/import-scraped-products-upsert.js <scraped-vending-products.json>");
  }

  if (process.env.IMPORT_PRODUCTS_SYNC_D1 !== "1") {
    process.env.CLOUDFLARE_SYNC_URL = "";
    process.env.CLOUDFLARE_SYNC_SECRET = "";
  }

  const jsonPath = path.resolve(process.cwd(), inputPath);
  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const categories = payload.categories ?? [];
  const products = payload.products ?? [];

  const appDir = path.resolve(__dirname, "..");
  const distDir = path.join(appDir, "dist");
  const app = await createStrapi({ appDir, distDir });
  await app.load();

  try {
    const categoryMap = new Map();
    let categorySort = 40;
    for (const category of categories) {
      const doc = await upsertCategory(app, category, categorySort);
      categoryMap.set(category.slug, doc.documentId);
      categorySort += 1;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let productSort = 1000;
    for (const product of products) {
      const categoryDocId = categoryMap.get(product.categorySlug);
      if (!categoryDocId) {
        skipped += 1;
        continue;
      }

      const result = await upsertProduct(app, product, categoryDocId, productSort);
      if (result === "created") created += 1;
      if (result === "updated") updated += 1;
      productSort += 1;
    }

    console.log(
      `Upserted scraped products into Strapi CMS. Categories: ${categories.length}, created: ${created}, updated: ${updated}, skipped: ${skipped}.`
    );
  } finally {
    await app.destroy().catch((error) => {
      if (!String(error?.message ?? "").includes("aborted")) throw error;
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
