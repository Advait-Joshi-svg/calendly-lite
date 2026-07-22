import { apiRequest } from "./apiClient";

// GET /api/public/users/:slug/slots?date=YYYY-MM-DD
export function fetchPublicSlots(slug, date) {
  return apiRequest(
    `/api/public/users/${encodeURIComponent(slug)}/slots?date=${encodeURIComponent(date)}`
  );
}

// POST /api/public/:slug/bookings
export function createPublicBooking(slug, payload) {
  return apiRequest(`/api/public/${encodeURIComponent(slug)}/bookings`, {
    method: "POST",
    body: payload,
  });
}