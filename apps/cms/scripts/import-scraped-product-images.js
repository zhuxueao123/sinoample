/* eslint-disable no-console */
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { createStrapi } = require("@strapi/strapi");

const productUid = "api::product.product";
const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

function slugPart(input, fallback = "image") {
  const value = String(input || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return value || fallback;
}

function uniqueUrls(product) {
  const urls = [];
  if (product.coverImageUrl) urls.push(product.coverImageUrl);
  for (const url of product.gallery ?? []) {
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

function extFromUrl(url, contentType) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (imageExtensions[type]) return imageExtensions[type];
  const pathname = new URL(url).pathname.toLowerCase();
  const match = pathname.match(/\.(jpe?g|png|webp|gif)$/);
  return match ? `.${match[1].replace("jpeg", "jpg")}` : ".jpg";
}

async function downloadImage(url, nameBase) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error(`not an image: ${contentType}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error("empty image response");

  const ext = extFromUrl(url, contentType);
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const name = `${slugPart(nameBase)}-${hash}${ext}`;
  const filePath = path.join(os.tmpdir(), name);
  await fsp.writeFile(filePath, bytes);

  return {
    path: filePath,
    filepath: filePath,
    name,
    originalFilename: name,
    type: contentType.split(";")[0].trim(),
    mimetype: contentType.split(";")[0].trim(),
    size: bytes.length
  };
}

async function uploadImage(strapi, url, nameBase, alternativeText) {
  const file = await downloadImage(url, nameBase);
  try {
    const uploaded = await strapi.plugin("upload").service("upload").upload({
      data: {
        fileInfo: {
          name: file.name,
          alternativeText
        }
      },
      files: file
    });
    const item = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!item?.id) throw new Error("upload returned no media id");
    return item;
  } finally {
    await fsp.rm(file.path, { force: true }).catch(() => {});
  }
}

async function syncDraftMediaRelations(strapi, documentId) {
  const rows = await strapi.db.connection("products")
    .select(["id", "published_at"])
    .where({ document_id: documentId })
    .orderBy("id", "asc");

  const draftRow = rows.find((row) => !row.published_at);
  const publishedRow = rows.find((row) => row.published_at);
  if (!draftRow || !publishedRow || draftRow.id === publishedRow.id) return false;

  const publishedMedia = await strapi.db.connection("files_related_mph")
    .select(["file_id", "field", "order"])
    .where({
      related_id: publishedRow.id,
      related_type: productUid
    })
    .whereIn("field", ["cover_image", "gallery", "og_image"])
    .orderBy("id", "asc");

  await strapi.db.connection("files_related_mph")
    .where({
      related_id: draftRow.id,
      related_type: productUid
    })
    .whereIn("field", ["cover_image", "gallery", "og_image"])
    .del();

  if (!publishedMedia.length) return true;

  await strapi.db.connection("files_related_mph").insert(
    publishedMedia.map((item) => ({
      file_id: item.file_id,
      related_id: draftRow.id,
      related_type: productUid,
      field: item.field,
      order: item.order
    }))
  );

  return true;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/import-scraped-product-images.js <scraped-vending-products.json>");
  }

  const maxProducts = Number(process.env.IMAGE_IMPORT_MAX_PRODUCTS || 0);
  const maxGallery = Number(process.env.IMAGE_IMPORT_MAX_GALLERY || 8);
  const forceReplace = process.env.IMAGE_IMPORT_FORCE === "1";
  const jsonPath = path.resolve(process.cwd(), inputPath);
  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const products = payload.products ?? [];

  const appDir = path.resolve(__dirname, "..");
  const distDir = path.join(appDir, "dist");
  const app = await createStrapi({ appDir, distDir });
  await app.load();

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const product of products) {
      if (maxProducts && processed >= maxProducts) break;
      processed += 1;

      const existing = await app.documents(productUid).findFirst({
        filters: { slug: product.slug },
        populate: ["cover_image", "gallery"]
      });

      if (!existing) {
        console.warn(`Missing product in CMS: ${product.slug}`);
        failed += 1;
        continue;
      }

      const hasCover = Boolean(existing.cover_image?.id);
      const hasGallery = Array.isArray(existing.gallery) && existing.gallery.length > 0;
      if (!forceReplace && hasCover && (maxGallery <= 0 || hasGallery)) {
        skipped += 1;
        continue;
      }

      const urls = uniqueUrls(product);
      const coverUrl = !forceReplace && hasCover ? null : urls[0];
      const galleryUrls = !forceReplace && hasGallery ? [] : urls.slice(1, 1 + maxGallery);
      const mediaIds = [];
      let coverId = existing.cover_image?.id ?? null;

      try {
        if (coverUrl) {
          console.log(`Uploading cover: ${product.slug}`);
          try {
            const media = await uploadImage(app, coverUrl, `${product.slug}-cover`, product.name);
            coverId = media.id;
          } catch (error) {
            console.warn(`Cover upload failed for ${product.slug}: ${error.message}`);
          }
        }

        for (let index = 0; index < galleryUrls.length; index += 1) {
          console.log(`Uploading gallery ${index + 1}/${galleryUrls.length}: ${product.slug}`);
          try {
            const media = await uploadImage(app, galleryUrls[index], `${product.slug}-gallery-${index + 1}`, product.name);
            mediaIds.push(media.id);
          } catch (error) {
            console.warn(`Gallery upload failed for ${product.slug} (${index + 1}): ${error.message}`);
          }
        }

        const data = {};
        if (coverId) data.cover_image = coverId;
        if (forceReplace) {
          if (mediaIds.length) data.gallery = mediaIds;
          else if (maxGallery > 0) data.gallery = [];
        } else if (!hasGallery && mediaIds.length) {
          data.gallery = mediaIds;
        }
        if (!Object.keys(data).length) {
          failed += 1;
          continue;
        }

        await app.documents(productUid).update({
          documentId: existing.documentId,
          data,
          status: "published"
        });
        await syncDraftMediaRelations(app, existing.documentId);
        updated += 1;
      } catch (error) {
        failed += 1;
        console.warn(`Image import failed for ${product.slug}: ${error.message}`);
      }
    }

    console.log(`Image import complete. Processed: ${processed}, updated: ${updated}, skipped: ${skipped}, failed: ${failed}.`);
  } finally {
    // Strapi 5 can emit a late tarn pool "aborted" error during one-off script
    // shutdown after successful writes. Exit explicitly once the import summary is
    // printed so the process status reflects the completed import.
    setTimeout(() => process.exit(0), 250);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
