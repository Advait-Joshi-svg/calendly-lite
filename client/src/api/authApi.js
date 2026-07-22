import { apiRequest } from "./apiClient";

// POST /api/auth/register -> 201 { message, user }  (NOTE: no token — backend
// intentionally does not log the user in on registration)
export function register({ name, email, password, slug }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password, slug },
  });
}

// POST /api/auth/login -> 200 { message, user, token }
export function login({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// GET /api/auth/me (auth) -> 200 { user }
export function fetchMe() {
  return apiRequest("/api/auth/me", { auth: true });
}
