export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getAuthToken() {
  try {
    return localStorage.getItem('prepnest_token') || null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeaders(options.headers || {}),
  };

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && getAuthToken()) {
    window.dispatchEvent(new CustomEvent('prepnest:auth-expired'));
  }

  return res;
}

export function notifyStatsUpdated() {
  window.dispatchEvent(new CustomEvent('prepnest:stats-updated'));
}

