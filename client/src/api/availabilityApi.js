import { apiRequest } from "./apiClient";

// GET /api/availability (auth) -> { availability: [{ id, user_id, day_of_week,
// start_time, end_time, created_at, updated_at }] }
// NOTE: this endpoint returns raw snake_case columns, unlike most of the rest
// of the API which aliases to camelCase. Not a frontend bug — matches the
// backend's models/availability.model.ts getAvailabilityRulesByUserId exactly.
export function fetchAvailability() {
  return apiRequest("/api/availability", { auth: true });
}

// POST /api/availability (auth) -> body { dayOfWeek, startTime, endTime }
// -> 201 { message, availability }
// NOTE: the DB has a UNIQUE(user_id, day_of_week) constraint, but the route
// doesn't catch that violation specially — a duplicate day currently surfaces
// as a generic 500, not a 409. We show a helpful message anyway on the frontend.
export function createAvailability({ dayOfWeek, startTime, endTime }) {
  return apiRequest("/api/availability", {
    method: "POST",
    auth: true,
    body: { dayOfWeek, startTime, endTime },
  });
}

// PATCH /api/availability/:id (auth) -> body { dayOfWeek, startTime, endTime }
// -> 200 { message, availability } | 404
export function updateAvailability(id, { dayOfWeek, startTime, endTime }) {
  return apiRequest(`/api/availability/${id}`, {
    method: "PATCH",
    auth: true,
    body: { dayOfWeek, startTime, endTime },
  });
}

// DELETE /api/availability/:id (auth) -> 200 { message, availability } | 404
export function deleteAvailability(id) {
  return apiRequest(`/api/availability/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
