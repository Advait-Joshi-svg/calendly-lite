const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details; // raw Zod issues array, when present
  }
}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

/**
 * Core request helper. `path` should start with "/api/...".
 * Automatically attaches Authorization: Bearer <token> when a token is set.
 */
export async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    if (!authToken) {
      throw new ApiError("Authentication required", 401);
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection.", 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some 500s or empty responses may not have a JSON body — that's fine.
  }

  if (!response.ok) {
    const message = data?.message || fallbackMessageFor(response.status);
    throw new ApiError(message, response.status, data?.errors);
  }

  return data;
}

function fallbackMessageFor(status) {
  switch (status) {
    case 400: return "That request wasn't valid.";
    case 401: return "You need to log in again.";
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find that.";
    case 409: return "That conflicts with something that already exists.";
    default: return "Something went wrong on our end.";
  }
}
