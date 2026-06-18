const PLACEHOLDER_HOSTS = ['your-backend-production-url.com'];

function isPlaceholderUrl(url: string) {
  return !url || PLACEHOLDER_HOSTS.some((host) => url.includes(host));
}

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
  return raw.replace(/\/$/, '');
}

/** @deprecated Prefer getApiBaseUrl() inside client fetch handlers. */
export const API_BASE_URL = getApiBaseUrl();

export function buildApiUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  if (!params) {
    return url;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

export function isNetworkFetchError(error: unknown): boolean {
  return error instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(error.message);
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (isNetworkFetchError(error)) {
      throw new Error(
        `Cannot reach the GreaterHR API at ${getApiBaseUrl()}. Make sure the backend is running (uvicorn on port 8000).`
      );
    }
    throw error;
  }
}
