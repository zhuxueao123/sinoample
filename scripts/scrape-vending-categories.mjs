import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outputJson = path.join(rootDir, "scripts", "scraped-vending-products.json");
const outputSql = path.join(rootDir, "scripts", "scraped-vending-products.sql");

const now = new Date().toISOString();
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const categories = [
  {
    site: "micron",
    siteName: "Micron Vending",
    categorySlug: "flower-vending-machines",
    categoryName: "Flower Vending Machines",
    categoryDescription: "Temperature-controlled vending systems designed for bouquets and fresh flower retail.",
    url: "https://www.micronvending.com/flower-vending-machine.html"
  },
  {
    site: "micron",
    siteName: "Micron Vending",
    categorySlug: "pet-vending-stations",
    categoryName: "Pet Vending Stations",
    categoryDescription: "Automated vending and service stations for pet food, treats, washing, and pet care products.",
    url: "https://www.micronvending.com/pet-vending-machine.html"
  }
];

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)));
}

function stripTags(html) {
  return decodeEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|dt|dd|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function attr(tag, name) {
  const match = String(tag).match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeEntities(match?.[2] ?? match?.[3] ?? match?.[4] ?? "");
}

function absolutize(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return "";
  }
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "user-agent": userAgent,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9"
    }
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return await response.text();
}

function anchors(html, base) {
  const items = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = match[0];
    const href = absolutize(attr(tag, "href"), base);
    const imgMatch = tag.match(/<img\b[^>]*>/i);
    items.push({
      href,
      title: attr(tag, "title"),
      text: stripTags(tag),
      image: imgMatch ? absolutize(attr(imgMatch[0], "src") || attr(imgMatch[0], "data-src"), base) : "",
      alt: imgMatch ? attr(imgMatch[0], "alt") : ""
    });
  }
  return items;
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=(["'])(.*?)\\1`, "i"),
    new RegExp(`<meta[^>]+content=(["'])(.*?)\\1[^>]+(?:name|property)=["']${escaped}["']`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[2]).trim();
  }
  return "";
}

function title(html) {
  return meta(html, "og:title") || decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

function isProductLink(seed, href, text) {
  if (!href) return false;
  const url = new URL(href);
  if (seed.site === "micron" && url.hostname !== "www.micronvending.com") return false;
  if (!url.pathname.endsWith(".html")) return false;
  if (/\/(de|spa|fra|it|th|vie|ara|kor|ru)\//i.test(url.pathname)) return false;
  const haystack = `${url.pathname} ${text}`.toLowerCase();
  if (seed.categorySlug === "flower-vending-machines") {
    return haystack.includes("flower") && !url.pathname.endsWith("/flower-vending-machine.html");
  }
  return (haystack.includes("pet") || haystack.includes("dog")) && !url.pathname.endsWith("/pet-vending-machine.html");
}

function isPaginationLink(seed, href) {
  if (!href) return false;
  const url = new URL(href);
  if (seed.site === "micron" && url.hostname !== "www.micronvending.com") return false;
  if (!url.searchParams.has("page")) return false;
  const path = url.pathname.toLowerCase();
  return seed.categorySlug === "flower-vending-machines"
    ? path.endsWith("/flower-vending-machine.html")
    : path.endsWith("/pet-vending-machine.html");
}

async function categoryProductLinks(seed) {
  const queue = [seed.url];
  const seenPages = new Set();
  const productLinks = new Map();

  while (queue.length && seenPages.size < 10) {
    const pageUrl = queue.shift();
    if (!pageUrl || seenPages.has(pageUrl)) continue;
    seenPages.add(pageUrl);

    let html = "";
    try {
      html = await fetchHtml(pageUrl);
    } catch (error) {
      console.warn(`Skipping category page ${pageUrl}: ${error.message}`);
      continue;
    }
    for (const link of anchors(html, pageUrl)) {
      const text = [link.text, link.title, link.alt].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (isPaginationLink(seed, link.href) && !seenPages.has(link.href) && !queue.includes(link.href)) {
        queue.push(link.href);
      }
      if (isProductLink(seed, link.href, text) && !productLinks.has(link.href)) {
        productLinks.set(link.href, {
          sourceUrl: link.href,
          sourceSite: seed.siteName,
          categorySlug: seed.categorySlug,
          listTitle: text,
          listImage: link.image
        });
      }
    }
  }

  return [...productLinks.values()];
}

function firstUsefulText(html, fallback) {
  const description = meta(html, "description") || meta(html, "og:description");
  if (description && description.length > 25) return description;
  const text = stripTags(html).split("\n").map((line) => line.trim()).filter(Boolean);
  return text.find((line) => line.length > 80 && !/home|products|contact|copyright/i.test(line)) || fallback;
}

function extractSpecs(html) {
  const specs = [];
  for (const match of html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)) {
    const label = stripTags(match[1]).replace(/:$/, "").trim();
    const value = stripTags(match[2]).trim();
    if (label && value && specs.length < 12) specs.push([label, value]);
  }

  return specs.slice(0, 12);
}

function specValue(specs, pattern) {
  return specs.find(([label]) => pattern.test(label))?.[1] ?? null;
}

function extractFeatures(html, description) {
  const text = description;
  const candidates = [
    /24\/7|24 hours?|self[- ]service/i,
    /cooling|refrigerat|temperature|fresh/i,
    /touch screen|screen/i,
    /card reader|cashless|payment|coin|bill validator|Nayax/i,
    /locker|slots?|capacity/i,
    /remote|inventory|management|software/i,
    /custom|OEM|ODM|branding/i,
    /outdoor|weatherproof|shelter/i,
    /stainless steel|304/i
  ];
  const features = [];
  for (const pattern of candidates) {
    const line = text
      .split(/\n|\. /)
      .map((item) => item.replace(/\s+/g, " ").trim())
      .find((item) => pattern.test(item) && item.length >= 20 && item.length <= 160);
    if (line && !features.includes(line)) features.push(line.replace(/[.;,]\s*$/, ""));
  }
  return features.slice(0, 8);
}

function cleanImage(url) {
  if (!url || url.startsWith("data:") || /lazy-bg|placeholder|captcha|flags|logo|icon_search|\{\{|%7b/i.test(url)) return "";
  if (url.endsWith("#")) return "";
  return url;
}

function extractDivById(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const openPattern = new RegExp(`<div\\b[^>]*id=["']${escaped}["'][^>]*>`, "i");
  const openMatch = openPattern.exec(html);
  if (!openMatch || openMatch.index < 0) return "";

  const start = openMatch.index;
  const from = start + openMatch[0].length;
  const tail = html.slice(from);
  const divTagPattern = /<\/?div\b[^>]*>/gi;
  let depth = 1;
  let cursor = 0;

  while (true) {
    const match = divTagPattern.exec(tail);
    if (!match || match.index < 0) break;
    cursor = match.index + match[0].length;
    if (/^<div\b/i.test(match[0])) depth += 1;
    if (/^<\/div/i.test(match[0])) depth -= 1;
    if (depth === 0) {
      return html.slice(start, from + cursor);
    }
  }

  return "";
}

function isLikelyProductImage(url) {
  const lower = String(url || "").toLowerCase();
  if (!lower) return false;
  if (!/^https?:\/\//.test(lower)) return false;
  if (/\/(logo|icon|flags?|avatar|banner|ad)\b/.test(lower)) return false;
  if (/sprite|thumbnail|thumb_|_thumb|small|loading|placeholder/.test(lower)) return false;
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(lower);
}

function imageScore(url) {
  const lower = url.toLowerCase();
  let score = 0;
  if (/\/upload\//.test(lower)) score += 4;
  if (/\/products?\//.test(lower)) score += 3;
  if (/detail|gallery|machine|flower|pet|dog|wash/.test(lower)) score += 2;
  if (/small|thumb|icon|logo/.test(lower)) score -= 8;
  return score;
}

function extractVideoUrl(html, base) {
  const urls = [];
  for (const match of html.matchAll(/<(?:video|source)\b[^>]*>/gi)) {
    const src = attr(match[0], "src");
    if (!src) continue;
    const abs = absolutize(src, base);
    if (abs && !urls.includes(abs) && /\.(mp4|webm|mov)(\?|$)/i.test(abs)) urls.push(abs);
  }
  for (const match of html.matchAll(/https?:\/\/[^\s"'<>]+?\.(?:mp4|webm|mov)(?:\?[^\s"'<>]*)?/gi)) {
    const value = match[0].trim();
    if (!urls.includes(value)) urls.push(value);
  }
  return urls[0] ?? null;
}

async function productDetail(link) {
  const html = await fetchHtml(link.sourceUrl);
  const menuDetailHtml = extractDivById(html, "menu-detail") || html;
  const name = title(html) || link.listTitle;
  const shortDescription = firstUsefulText(html, link.listTitle);
  const coverImageUrl = cleanImage(meta(html, "og:image")) || cleanImage(link.listImage) || null;
  const specifications = extractSpecs(html);
  const delivery = specValue(specifications, /^delivery$/i);
  const minimumOrderQuantity = specValue(specifications, /minimum\s*order\s*quantity/i);
  const supplyAbility = specValue(specifications, /supply\s*ability/i);
  const countryOfOrigin = specValue(specifications, /country\s*of\s*origin/i);
  const stockTime = specValue(specifications, /stock\s*time/i);
  const modelNumber = specifications.find(([label]) => /model/i.test(label))?.[1] ?? null;
  const keyFeatures = extractFeatures(html, shortDescription);
  const videoUrl = extractVideoUrl(menuDetailHtml, link.sourceUrl);
  const imageUrls = [...menuDetailHtml.matchAll(/<img\b[^>]*>/gi)]
    .map((match) =>
      cleanImage(absolutize(attr(match[0], "src") || attr(match[0], "data-src") || attr(match[0], "data-original"), link.sourceUrl))
    )
    .filter(isLikelyProductImage)
    .sort((a, b) => imageScore(b) - imageScore(a))
    .filter(Boolean)
    .filter((url, index, array) => array.indexOf(url) === index)
    .slice(0, 12);

  return {
    categorySlug: link.categorySlug,
    sourceSite: link.sourceSite,
    sourceUrl: link.sourceUrl,
    name,
    slug: slugify(name),
    modelNumber,
    delivery,
    minimumOrderQuantity,
    supplyAbility,
    countryOfOrigin,
    stockTime,
    shortDescription,
    overview: shortDescription,
    coverImageUrl: imageUrls[0] || coverImageUrl,
    gallery: imageUrls,
    videoUrl,
    keyFeatures,
    specifications,
    seoTitle: name,
    seoDescription: shortDescription
  };
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function productSql(product, sortOrder) {
  return `INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  delivery, minimum_order_quantity, supply_ability, country_of_origin, stock_time, source_site, source_url,
  cover_image_url, gallery_json, video_url, key_features_json, specifications_json, is_featured, sort_order,
  seo_title, seo_description, og_image_url, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = ${sqlString(product.categorySlug)} LIMIT 1),
  ${sqlString(product.categorySlug)},
  ${sqlString(product.name)},
  ${sqlString(product.slug)},
  ${sqlString(product.modelNumber)},
  ${sqlString(product.shortDescription)},
  ${sqlString(product.overview)},
  ${sqlString(product.delivery)},
  ${sqlString(product.minimumOrderQuantity)},
  ${sqlString(product.supplyAbility)},
  ${sqlString(product.countryOfOrigin)},
  ${sqlString(product.stockTime)},
  ${sqlString(product.sourceSite)},
  ${sqlString(product.sourceUrl)},
  ${sqlString(product.coverImageUrl)},
  ${sqlString(JSON.stringify(product.gallery))},
  ${sqlString(product.videoUrl)},
  ${sqlString(JSON.stringify(product.keyFeatures))},
  ${sqlString(JSON.stringify(product.specifications))},
  0,
  ${sortOrder},
  ${sqlString(product.seoTitle)},
  ${sqlString(product.seoDescription)},
  ${sqlString(product.coverImageUrl)},
  ${sqlString(now)},
  ${sqlString(now)}
) ON CONFLICT(category_slug, slug) DO UPDATE SET
  name=excluded.name,
  model_number=excluded.model_number,
  short_description=excluded.short_description,
  overview=excluded.overview,
  delivery=excluded.delivery,
  minimum_order_quantity=excluded.minimum_order_quantity,
  supply_ability=excluded.supply_ability,
  country_of_origin=excluded.country_of_origin,
  stock_time=excluded.stock_time,
  source_site=excluded.source_site,
  source_url=excluded.source_url,
  cover_image_url=excluded.cover_image_url,
  gallery_json=excluded.gallery_json,
  video_url=excluded.video_url,
  key_features_json=excluded.key_features_json,
  specifications_json=excluded.specifications_json,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  og_image_url=excluded.og_image_url,
  published_at=excluded.published_at,
  updated_at=excluded.updated_at;`;
}

const categoryRows = new Map();
for (const item of categories) {
  categoryRows.set(item.categorySlug, {
    name: item.categoryName,
    slug: item.categorySlug,
    description: item.categoryDescription
  });
}

const links = [];
for (const category of categories) {
  console.log(`Crawling ${category.url}`);
  links.push(...(await categoryProductLinks(category)));
}

const seenUrls = new Set();
const rawProducts = [];
for (const link of links) {
  if (seenUrls.has(link.sourceUrl)) continue;
  seenUrls.add(link.sourceUrl);
  console.log(`Fetching ${link.sourceUrl}`);
  try {
    rawProducts.push(await productDetail(link));
  } catch (error) {
    console.warn(`Skipping product ${link.sourceUrl}: ${error.message}`);
  }
}

const slugCounts = new Map();
const products = rawProducts.map((product) => {
  const key = `${product.categorySlug}::${product.slug}`;
  const count = slugCounts.get(key) || 0;
  slugCounts.set(key, count + 1);
  return count === 0
    ? product
    : { ...product, slug: `${product.slug}-${slugify(product.sourceSite).replace(/-vending$/, "")}` };
});

let categorySort = 40;
let productSort = 1000;
const sql = [];
for (const category of categoryRows.values()) {
  sql.push(`INSERT INTO product_categories (strapi_id, name, slug, description, sort_order, is_active, updated_at)
VALUES (NULL, ${sqlString(category.name)}, ${sqlString(category.slug)}, ${sqlString(category.description)}, ${categorySort}, 1, ${sqlString(now)})
ON CONFLICT(slug) DO UPDATE SET
  name=excluded.name,
  description=excluded.description,
  is_active=1,
  updated_at=excluded.updated_at;`);
  categorySort += 1;
}

for (const product of products) {
  sql.push(productSql(product, productSort));
  productSort += 1;
}

fs.writeFileSync(
  outputJson,
  `${JSON.stringify({ generatedAt: now, sourceCategoryUrls: categories.map((item) => item.url), categories: [...categoryRows.values()], productCount: products.length, products }, null, 2)}\n`
);
fs.writeFileSync(outputSql, `${sql.join("\n")}\n`);

console.log(`Generated ${outputJson}`);
console.log(`Generated ${outputSql}`);
console.log(`Products: ${products.length}`);
