export function resolveApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';

  if (process.env.NODE_ENV === 'development') {
    return raw || 'http://localhost:8000';
  }

  if (!raw || raw.includes('your-backend-production-url.com')) {
    return 'https://avicorex-hrms-server.onrender.com';
  }

  return raw.replace(/\/$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();