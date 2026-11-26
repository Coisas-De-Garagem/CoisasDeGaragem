const DEFAULT_PRODUCTION_ORIGINS = [
  'https://www.coisasdegaragem.com.br',
  'https://coisasdegaragem.com.br',
];

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

export interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

function normalizeOrigin(value?: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

export function getAllowedFrontendOrigins(): string[] {
  const isProduction = process.env.NODE_ENV === 'production';
  const corsOriginRaw = process.env.CORS_ORIGIN ?? process.env.CORS_ORIGINS;
  const configured = corsOriginRaw
    ? corsOriginRaw
        .split(',')
        .map((o) => normalizeOrigin(o))
        .filter((o): o is string => Boolean(o))
    : [];

  return Array.from(
    new Set([
      ...DEFAULT_PRODUCTION_ORIGINS,
      ...(isProduction ? [] : DEFAULT_DEV_ORIGINS),
      ...configured,
    ]),
  );
}

function extractRequestOrigin(req?: RequestLike): string | null {
  if (!req?.headers) return null;

  const originHeader = req.headers.origin;
  const rawOrigin = Array.isArray(originHeader)
    ? originHeader[0]
    : originHeader;
  const parsedOrigin = normalizeOrigin(rawOrigin);
  if (parsedOrigin) return parsedOrigin;

  const refererHeader = req.headers.referer;
  const rawReferer = Array.isArray(refererHeader)
    ? refererHeader[0]
    : refererHeader;
  return normalizeOrigin(rawReferer);
}

/**
 * Resolve a URL base do frontend para QR Codes e links públicos.
 * Prioriza o Origin/Referer da requisição quando presente na allowlist
 * (ex.: https://www.coisasdegaragem.com.br ou https://coisasdegaragem.com.br),
 * garantindo que QR Codes gerados em produção nunca apontem para localhost.
 */
export function resolveFrontendUrl(
  req?: RequestLike,
  configuredFrontendUrl?: string,
): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = getAllowedFrontendOrigins();

  const requestOrigin = extractRequestOrigin(req);
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  const envUrl = normalizeOrigin(
    configuredFrontendUrl ?? process.env.FRONTEND_URL,
  );
  if (envUrl && !(isProduction && isLocalhostOrigin(envUrl))) {
    return envUrl;
  }

  return isProduction ? DEFAULT_PRODUCTION_ORIGINS[0] : DEFAULT_DEV_ORIGINS[0];
}
