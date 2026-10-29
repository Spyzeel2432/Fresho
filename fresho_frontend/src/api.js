const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export const apiEnabled = Boolean(baseUrl);

export async function api(path, { method = 'GET', body, token } = {}) {
  if (!baseUrl) throw new Error('VITE_API_URL is not configured.');
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Cannot reach the Fresho API. Start the backend on port 5000 and restart the frontend.');
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'The request failed.');
  return payload;
}
