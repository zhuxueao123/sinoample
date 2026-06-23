/* eslint-disable no-console */
const { Client } = require("pg");

const productType = "api::product.product";
const fields = ["cover_image", "gallery", "og_image"];

async function main() {
  const slug = process.argv[2] || null;
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: String(process.env.DATABASE_SSL || "").toLowerCase() === "true"
  });

  await client.connect();
  try {
    await client.query("BEGIN");

    const productFilter = slug ? "AND p.slug = $1" : "";
    const documents = await client.query(
      `SELECT DISTINCT p.document_id
       FROM products p
       JOIN products published ON published.document_id = p.document_id AND published.published_at IS NOT NULL
       JOIN products draft ON draft.document_id = p.document_id AND draft.published_at IS NULL
       WHERE 1=1 ${productFilter}
       ORDER BY p.document_id`,
      slug ? [slug] : []
    );

    let updated = 0;
    for (const row of documents.rows) {
      const versions = await client.query(
        `SELECT id, published_at
         FROM products
         WHERE document_id = $1
         ORDER BY id`,
        [row.document_id]
      );

      const draftRow = versions.rows.find((item) => !item.published_at);
      const publishedRow = versions.rows.find((item) => item.published_at);
      if (!draftRow || !publishedRow) continue;

      const media = await client.query(
        `SELECT file_id, field, "order"
         FROM files_related_mph
         WHERE related_id = $1
           AND related_type = $2
           AND field = ANY($3::text[])
         ORDER BY id`,
        [publishedRow.id, productType, fields]
      );

      await client.query(
        `DELETE FROM files_related_mph
         WHERE related_id = $1
           AND related_type = $2
           AND field = ANY($3::text[])`,
        [draftRow.id, productType, fields]
      );

      for (const item of media.rows) {
        await client.query(
          `INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
           VALUES ($1, $2, $3, $4, $5)`,
          [item.file_id, draftRow.id, productType, item.field, item.order]
        );
      }

      updated += 1;
    }

    await client.query("COMMIT");
    console.log(`Draft media repair complete. Updated documents: ${updated}.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
