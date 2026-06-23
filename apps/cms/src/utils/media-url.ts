function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function getMediaBaseUrl() {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (publicUrl) {
    return publicUrl.replace(/\/+$/, '');
  }

  const fallbackUrl = process.env.PUBLIC_URL?.trim();
  return fallbackUrl ? fallbackUrl.replace(/\/+$/, '') : null;
}

function getRootPath() {
  return trimSlashes(process.env.R2_ROOT_PATH?.trim() || '');
}

export function resolveMediaUrl(value: unknown) {
  const url = String(value ?? '').trim();
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const mediaBaseUrl = getMediaBaseUrl();
  if (!mediaBaseUrl) return url;

  const rootPath = getRootPath();
  const rootUploadsPath = rootPath ? `${rootPath}/uploads/` : 'uploads/';

  if (url.startsWith('/uploads/')) {
    const relativePath = url.slice('/uploads/'.length);
    return joinUrl(mediaBaseUrl, `${rootUploadsPath}${relativePath}`);
  }

  if (url.startsWith('uploads/')) {
    return joinUrl(mediaBaseUrl, `${rootPath ? `${rootPath}/` : ''}${url}`);
  }

  if (rootPath && url.startsWith(`/${rootUploadsPath}`)) {
    return joinUrl(mediaBaseUrl, url);
  }

  if (rootPath && url.startsWith(rootUploadsPath)) {
    return joinUrl(mediaBaseUrl, url);
  }

  if (url.startsWith('/')) {
    return joinUrl(mediaBaseUrl, url);
  }

  return url;
}

export function normalizeUploadFileRecord(record: any): any {
  if (!record || typeof record !== 'object') return record;

  if (Array.isArray(record)) {
    record.forEach((item) => normalizeUploadFileRecord(item));
    return record;
  }

  if ('url' in record) {
    record.url = resolveMediaUrl(record.url) ?? record.url;
  }

  if ('previewUrl' in record) {
    record.previewUrl = resolveMediaUrl(record.previewUrl) ?? record.previewUrl;
  }

  if ('preview_url' in record) {
    record.preview_url = resolveMediaUrl(record.preview_url) ?? record.preview_url;
  }

  if (record.formats && typeof record.formats === 'object') {
    Object.values(record.formats).forEach((format) => normalizeUploadFileRecord(format));
  }

  return record;
}
