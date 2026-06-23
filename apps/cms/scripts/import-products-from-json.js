/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { createStrapi } = require("@strapi/strapi");

const categoryUid = "api::product-category.product-category";
const productUid = "api::product.product";

async function upsertCategory(strapi, category, sortOrder) {
  const existing = await strapi.documents(categoryUid).findFirst({
    filters: { slug: category.slug }
  });

  const data = {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sort_order: sortOrder,
    is_active: true
  };

  if (!existing) {
    const created = await strapi.documents(categoryUid).create({
      data,
      status: "published"
    });
    return created;
  }

  const updated = await strapi.documents(categoryUid).update({
    documentId: existing.documentId,
    data,
    status: "published"
  });
  return updated;
}

async function upsertProduct(strapi, product, categoryDocId, sortOrder) {
  const existing = await strapi.documents(productUid).findFirst({
    filters: { slug: product.slug }
  });

  const data = {
    name: product.name,
    slug: product.slug,
    category: categoryDocId,
    model_number: product.modelNumber ?? null,
    short_description: product.shortDescription ?? null,
    overview: product.overview ?? null,
    key_features: product.keyFeatures ?? [],
    specifications: product.specifications ?? [],
    dimensions: product.dimensions ?? null,
    is_featured: Boolean(sortOrder <= 4),
    sort_order: sortOrder
  };

  if (!existing) {
    await strapi.documents(productUid).create({
      data,
      status: "published"
    });
    return;
  }

  await strapi.documents(productUid).update({
    documentId: existing.documentId,
    data,
    status: "published"
  });
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node import-products-from-json.js <json-file>");
  }

  const jsonPath = path.resolve(inputPath);
  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const categories = payload.categories ?? [];
  const products = payload.products ?? [];

  const appDir = process.cwd();
  const distDir = path.join(appDir, "dist");
  const app = await createStrapi({ appDir, distDir });
  await app.load();

  try {
    const existingProducts = await app.documents(productUid).findMany({
      fields: ["documentId"],
      pagination: { pageSize: 1000 }
    });

    for (const product of existingProducts) {
      await app.documents(productUid).delete({ documentId: product.documentId });
    }

    const existingCategories = await app.documents(categoryUid).findMany({
      fields: ["documentId"],
      pagination: { pageSize: 1000 }
    });

    for (const category of existingCategories) {
      await app.documents(categoryUid).delete({ documentId: category.documentId });
    }

    const categoryMap = new Map();
    let categorySort = 1;
    for (const category of categories) {
      const doc = await upsertCategory(app, category, categorySort);
      categoryMap.set(category.slug, doc.documentId);
      categorySort += 1;
    }

    let productSort = 1;
    for (const product of products) {
      const categoryDocId = categoryMap.get(product.categorySlug);
      if (!categoryDocId) continue;
      await upsertProduct(app, product, categoryDocId, productSort);
      productSort += 1;
    }

    console.log(`Imported ${categories.length} categories and ${products.length} products into Strapi.`);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
