import { apiRequest } from "./apiClient";

// GET /api/public/users/:slug/slots?date=YYYY-MM-DD
// -> { slug, date, timezone, slots: [{ startsAt, endsAt }] }
// NOTE: no timezone query param exists on this endpoint — the backend
// resolves slots using the HOST's stored timezone (from their availability
// rule), not the visitor's. `timezone` in the response is null if the host
// has no rule for that day of week.
// NOTE: this endpoint does not currently return the host's display name.
// Consider adding `name` to the response (call getUserBySlug in
// public.routes.ts) so the page doesn't need a second lookup.
export function fetchPublicSlots(slug, dateISO) {
  return apiRequest(`/api/public/${slug}/slots?date=${dateISO}`);
}

// POST /api/public/users/:slug/bookings
// body: { guestName, guestEmail, startsAt, endsAt }
// -> 201 { message, booking } | 400 validation | 404 host not found | 409 conflict
export function createPublicBooking(slug, { guestName, guestEmail, startsAt, endsAt }) {
  return apiRequest(`/api/public/users/${slug}/bookings`, {
    method: "POST",
    body: { guestName, guestEmail, startsAt, endsAt },
  });
}
