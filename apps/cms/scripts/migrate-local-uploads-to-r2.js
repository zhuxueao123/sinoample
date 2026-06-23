/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const dryRun = process.argv.includes('--dry-run');

const requiredEnv = [
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
];

if (!dryRun) {
  requiredEnv.push('R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET');
}

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../public/uploads');
const rootPath = trimSlashes(process.env.R2_ROOT_PATH || 'cms');
const keyPrefix = rootPath ? `${rootPath}/uploads` : 'uploads';
const urlPrefix = rootPath ? `/${rootPath}/uploads` : '/uploads';

const s3 = dryRun ? null : new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION || 'auto',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const files = listFiles(uploadsDir);
  console.log(`Found ${files.length} files under ${uploadsDir}`);
  console.log(`Target bucket: ${process.env.R2_BUCKET}`);
  console.log(`Target prefix: ${keyPrefix}/`);

  if (!dryRun) {
    for (const filePath of files) {
      const relativePath = path.relative(uploadsDir, filePath).split(path.sep).join('/');
      const key = `${keyPrefix}/${relativePath}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: contentType(filePath),
      }));
    }
  }

  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: String(process.env.DATABASE_SSL || '').toLowerCase() === 'true',
  });

  await client.connect();
  try {
    await client.query('BEGIN');
    const before = await client.query(
      "SELECT count(*)::int AS count FROM files WHERE provider = 'local' OR url LIKE '/uploads/%'"
    );

    if (!dryRun) {
      await client.query(
        `UPDATE files
         SET provider = 'aws-s3',
             url = CASE WHEN url LIKE '/uploads/%' THEN $1 || substring(url from 9) ELSE url END,
             preview_url = CASE WHEN preview_url LIKE '/uploads/%' THEN $1 || substring(preview_url from 9) ELSE preview_url END,
             formats = CASE
               WHEN formats IS NULL THEN formats
               ELSE replace(formats::text, '"/uploads/', '"' || $1 || '/')::jsonb
             END,
             updated_at = now()
         WHERE provider = 'local' OR url LIKE '/uploads/%' OR preview_url LIKE '/uploads/%' OR formats::text LIKE '%"/uploads/%'`,
        [urlPrefix]
      );
    }

    const after = await client.query(
      "SELECT provider, count(*)::int AS count FROM files GROUP BY provider ORDER BY provider"
    );

    if (dryRun) {
      await client.query('ROLLBACK');
    } else {
      await client.query('COMMIT');
    }

    console.log(`Media rows to migrate: ${before.rows[0].count}`);
    console.log(after.rows);
    console.log(dryRun ? 'Dry run complete; no files uploaded or rows changed.' : 'Migration complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.pdf') return 'application/pdf';
  return 'application/octet-stream';
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
