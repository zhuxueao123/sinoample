import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const productsDir = path.join(rootDir, "products");
const outputSql = path.join(rootDir, "scripts", "import-products.sql");
const outputJson = path.join(rootDir, "scripts", "import-products.json");

const now = new Date().toISOString();

const categories = new Map();
const products = new Map();

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function categoryFor(model, spec, fileName) {
  const text = `${model} ${spec}`.toLowerCase();
  const fromFile = fileName.toLowerCase();
  if (text.includes("dog") || text.includes("pet")) {
    return {
      slug: "pet-vending-stations",
      name: "Pet Vending Stations",
      description: "Automated vending and service stations for pet food, treats, and related services."
    };
  }
  if (text.includes("locker")) {
    return {
      slug: "locker-vending-machines",
      name: "Locker Vending Machines",
      description: "Smart locker-based vending units for ambient and controlled product pickup workflows."
    };
  }
  if (fromFile.includes("flower")) {
    return {
      slug: "flower-vending-machines",
      name: "Flower Vending Machines",
      description: "Temperature-controlled vending systems designed for bouquets and fresh flower retail."
    };
  }
  if (fromFile.includes("pet")) {
    return {
      slug: "pet-vending-stations",
      name: "Pet Vending Stations",
      description: "Automated vending and service stations for pet food, treats, and related services."
    };
  }
  if (text.includes("flower")) {
    return {
      slug: "flower-vending-machines",
      name: "Flower Vending Machines",
      description: "Temperature-controlled vending systems designed for bouquets and fresh flower retail."
    };
  }
  return {
    slug: "smart-vending-machines",
    name: "Smart Vending Machines",
    description: "Connected vending machines with remote management and flexible hardware configurations."
  };
}

function parseLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isMachineRow(row) {
  const item = String(row[0] ?? "").trim();
  const model = String(row[1] ?? "").trim();
  if (!/^\d+$/.test(item)) return false;
  if (!model) return false;
  const m = model.toLowerCase();
  const blocked = [
    "optional",
    "wooden case",
    "card reader",
    "receipt printer",
    "bill validator",
    "coin changer",
    "coin receive",
    "remark",
    "advertisement screen",
    "qr scaner",
    "age checker"
  ];
  return !blocked.some((k) => m.includes(k));
}

function numericTiers(row) {
  const nums = [];
  for (const cell of row.slice(4)) {
    const n = Number(cell);
    if (Number.isFinite(n) && n > 0) nums.push(Number(n.toFixed(2)));
  }
  return nums;
}

for (const file of fs.readdirSync(productsDir).filter((f) => f.endsWith(".xls"))) {
  const workbook = XLSX.readFile(path.join(productsDir, file));
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) continue;
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {
    header: 1,
    blankrows: false,
    defval: ""
  });

  for (const row of rows) {
    if (!isMachineRow(row)) continue;

    const model = String(row[1] ?? "").replace(/\s+/g, " ").trim();
    const dimensions = String(row[2] ?? "").replace(/\s+/g, " ").trim();
    const mainSpec = String(row[3] ?? "").trim();
    const softwareFeatures = String(row[4] ?? "").trim();
    const prices = numericTiers(row);

    const category = categoryFor(model, mainSpec, file);
    categories.set(category.slug, category);

    const modelCode = model.match(/[A-Z]{1,3}\d{1,3}(?:-[A-Z]+)?/);
    const slugBase = modelCode ? modelCode[0].toLowerCase() : slugify(model);
    const uniqueKey = `${category.slug}::${slugBase}`;
    const slug = products.has(uniqueKey) ? `${slugBase}-${products.size + 1}` : slugBase;

    const mainLines = parseLines(mainSpec);
    const featureLines = parseLines(softwareFeatures);
    const shortDescription = mainLines[0] || `${category.name} with smart control and remote management.`;

    const specs = [];
    if (dimensions) specs.push(["Dimensions", dimensions]);
    if (prices[0]) specs.push(["Price (1-4 units, USD)", String(prices[0])]);
    if (prices[1]) specs.push(["Price (5-9 units, USD)", String(prices[1])]);
    if (prices[2]) specs.push(["Price (10-29 units, USD)", String(prices[2])]);
    if (prices[3]) specs.push(["Price (30+ units, USD)", String(prices[3])]);

    products.set(uniqueKey, {
      categorySlug: category.slug,
      name: model,
      slug,
      modelNumber: modelCode ? modelCode[0] : null,
      shortDescription,
      overview: mainLines.join("\n"),
      dimensions,
      keyFeatures: featureLines,
      specifications: specs
    });
  }
}

const sql = [];
sql.push("DELETE FROM products;");
sql.push("DELETE FROM product_categories;");

let categorySort = 1;
for (const category of categories.values()) {
  sql.push(
    `INSERT INTO product_categories (strapi_id, name, slug, description, sort_order, is_active, updated_at)
VALUES (NULL, ${sqlString(category.name)}, ${sqlString(category.slug)}, ${sqlString(category.description)}, ${categorySort}, 1, ${sqlString(now)});`
  );
  categorySort += 1;
}

let productSort = 1;
for (const product of products.values()) {
  sql.push(
    `INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = ${sqlString(product.categorySlug)} LIMIT 1),
  ${sqlString(product.categorySlug)},
  ${sqlString(product.name)},
  ${sqlString(product.slug)},
  ${sqlString(product.modelNumber)},
  ${sqlString(product.shortDescription)},
  ${sqlString(product.overview)},
  ${sqlString(JSON.stringify(product.keyFeatures))},
  ${sqlString(JSON.stringify(product.specifications))},
  ${sqlString(product.dimensions || null)},
  ${productSort <= 4 ? 1 : 0},
  ${productSort},
  ${sqlString(now)},
  ${sqlString(now)}
);`
  );
  productSort += 1;
}

fs.writeFileSync(outputSql, `${sql.join("\n")}\n`);
const jsonOutput = {
  generatedAt: now,
  categories: Array.from(categories.values()),
  products: Array.from(products.values())
};
fs.writeFileSync(outputJson, `${JSON.stringify(jsonOutput, null, 2)}\n`);
console.log(`Generated ${outputSql}`);
console.log(`Generated ${outputJson}`);
console.log(`Categories: ${categories.size}, products: ${products.size}`);
