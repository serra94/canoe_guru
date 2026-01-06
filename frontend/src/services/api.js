const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8002";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchEvents() {
  return request("/events");
}

export async function fetchEvent(eventId) {
  return request(`/events/${eventId}`);
}

export async function fetchEventCategories(eventId) {
  return request(`/events/${eventId}/categories`);
}

export async function fetchEventAthletes(eventId, categoryId) {
  return request(`/events/${eventId}/categories/${categoryId}/athletes`);
}

export async function fetchEventResults(eventId) {
  return request(`/events/${eventId}/results`);
}
