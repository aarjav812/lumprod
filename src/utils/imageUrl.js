const DRIVE_HOSTS = new Set([
  'drive.google.com',
  'docs.google.com',
]);

const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

const sanitizeInputUrl = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '');

const sanitizeDriveId = (value) => {
  const cleaned = String(value || '')
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/[^A-Za-z0-9_-]/g, '');

  return DRIVE_ID_PATTERN.test(cleaned) ? cleaned : '';
};

const extractGoogleDriveId = (url) => {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (!DRIVE_HOSTS.has(parsed.hostname)) return '';

    const idFromQuery = sanitizeDriveId(parsed.searchParams.get('id'));
    if (idFromQuery) return idFromQuery;

    const fileMatch = parsed.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/i);
    if (fileMatch?.[1]) return sanitizeDriveId(fileMatch[1]);

    const dMatch = parsed.pathname.match(/\/d\/([A-Za-z0-9_-]+)/i);
    if (dMatch?.[1]) return sanitizeDriveId(dMatch[1]);

    return '';
  } catch {
    // Fallback for malformed URLs pasted with extra characters.
    const pathMatch = String(url).match(/\/file\/d\/([A-Za-z0-9_-]{10,})|\bid=([A-Za-z0-9_-]{10,})/i);
    if (pathMatch?.[1]) return sanitizeDriveId(pathMatch[1]);
    if (pathMatch?.[2]) return sanitizeDriveId(pathMatch[2]);
    return '';
  }
};

export const toDirectImageUrl = (rawUrl) => {
  const normalized = sanitizeInputUrl(rawUrl);
  if (!normalized) return '';

  const driveId = extractGoogleDriveId(normalized);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  return normalized;
};

export const getImageUrlCandidates = (rawUrl) => {
  const normalized = sanitizeInputUrl(rawUrl);
  if (!normalized) return [];

  const driveId = extractGoogleDriveId(normalized);
  if (!driveId) return [normalized];

  return [
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${driveId}=w1600`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
  ];
};
