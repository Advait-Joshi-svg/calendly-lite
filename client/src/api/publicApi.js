import apiClient from "./apiClient";

export function getPublicSlots(slug, date) {
  return apiClient.get(
    `/api/public/users/${slug}/slots?date=${encodeURIComponent(date)}`
  );
}

export function createPublicBooking(slug, payload) {
  return apiClient.post(`/api/public/${slug}/bookings`, payload);
}