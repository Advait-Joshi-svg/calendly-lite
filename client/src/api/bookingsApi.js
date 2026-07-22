import { apiRequest } from "./apiClient";

// GET /api/bookings (auth) -> { bookings: [{ id, guestName, guestEmail,
// startsAt, endsAt, status, createdAt, rescheduledAt }] }
// NOTE: backend only returns UPCOMING, CONFIRMED bookings (ends_at >= NOW()
// AND status = 'confirmed') — there is no history/past-bookings endpoint.
export function fetchUpcomingBookings() {
  return apiRequest("/api/bookings", { auth: true });
}

// PATCH /api/bookings/:id/cancel (auth) -> 200 { message, booking }
// | 404 not found | 403 forbidden | 409 already cancelled
export function cancelBooking(bookingId) {
  return apiRequest(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    auth: true,
  });
}

// PATCH /api/bookings/:id/reschedule (auth) -> body { startsAt, endsAt }
// -> 200 { message, booking }
// | 404 not found | 403 forbidden | 409 cancelled or time conflict
export function rescheduleBooking(bookingId, { startsAt, endsAt }) {
  return apiRequest(`/api/bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    auth: true,
    body: { startsAt, endsAt },
  });
}
