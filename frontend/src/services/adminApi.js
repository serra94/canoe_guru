const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8002";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }

  let errorDetail = null;
  try {
    const body = await response.json();
    errorDetail = body.detail ?? body;
  } catch {
    errorDetail = await response.text();
  }
  const error = new Error("Request failed");
  error.status = response.status;
  error.detail = errorDetail;
  throw error;
}

export function listEvents() {
  return request("/admin/events");
}

export function createEvent(payload) {
  return request("/admin/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateEvent(eventId, payload) {
  return request(`/admin/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteEvent(eventId) {
  return request(`/admin/events/${eventId}`, {
    method: "DELETE"
  });
}

export function listCategories(eventId) {
  return request(`/admin/events/${eventId}/categories`);
}

export function createCategory(eventId, payload) {
  return request(`/admin/events/${eventId}/categories`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategory(eventId, categoryId, payload) {
  return request(`/admin/events/${eventId}/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCategory(eventId, categoryId) {
  return request(`/admin/events/${eventId}/categories/${categoryId}`, {
    method: "DELETE"
  });
}

export function importStartlist(eventId, categoryId, payload) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/startlist`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listCategoryAthletes(eventId, categoryId) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/athletes`);
}

export function createCategoryAthlete(eventId, categoryId, payload) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/athletes`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategoryAthlete(eventId, categoryId, athleteId, payload) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/athletes/${athleteId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCategoryAthlete(eventId, categoryId, athleteId) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/athletes/${athleteId}`, {
    method: "DELETE"
  });
}

export function validateCategory(eventId, categoryId) {
  return request(`/admin/events/${eventId}/categories/${categoryId}/validate`);
}
