// Centralized place for all backend calls.
// Nothing else in the app should call fetch() directly against the API —
// keeping it here means we only change one file if the backend URL,
// auth header, or error handling strategy ever changes.

const BASE_URL = '/api'; // proxied to the Express server in dev (see vite.config.js)

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body (fine for some endpoints)
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function checkHealth() {
  return request('/health');
}

// Auth, search, and chat functions (login, register, searchQuery, getChats, ...)
// will be added here in later phases as the matching backend routes are built.
