import { apiRequest } from "./client";

export const bookingService = {
  checkAvailability(startTime, endTime) {
    const params = new URLSearchParams({ startTime, endTime });
    return apiRequest(`/booking/availability?${params}`);
  },
  createBooking({ summary, description, startTime, endTime }) {
    return apiRequest("/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, description, startTime, endTime }),
    });
  },
  cancelBooking(eventId) {
    return apiRequest(`/booking/${eventId}`, { method: "DELETE" });
  },
  rescheduleBooking(eventId, startTime, endTime) {
    return apiRequest(`/booking/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, endTime }),
    });
  },
  findNextAvailableSlots(startTime, duration, count) {
    const params = new URLSearchParams({ startTime });
    if (duration) params.set("duration", duration);
    if (count) params.set("count", count);
    return apiRequest(`/booking/next-slots?${params}`);
  },
  getUpcomingBookings(maxResults) {
    const params = maxResults ? `?maxResults=${maxResults}` : "";
    return apiRequest(`/booking/upcoming${params}`);
  },
};
