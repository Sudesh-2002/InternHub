import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Student Profile ───────────────────────────────────────────────────────────

export const fetchProfile = () =>
  API.get("/profile").then((res) => res.data);

export const updateProfile = (payload) =>
  API.put("/profile", payload).then((res) => res.data);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/profile/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

export const deleteResume = () =>
  API.delete("/profile/resume").then((res) => res.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return API.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

export const deleteAvatar = () =>
  API.delete("/profile/avatar").then((res) => res.data);

// ── Company: Internship Listings ──────────────────────────────────────────────

/**
 * Get all listings for the logged-in company.
 * Supports optional filters: { status, search, page }
 */
export const fetchCompanyListings = (params = {}) =>
  API.get("/company/internships", { params }).then((res) => res.data);

/**
 * Get a single listing by ID.
 */
export const fetchListing = (id) =>
  API.get(`/company/internships/${id}`).then((res) => res.data);

/**
 * Post a new internship listing.
 * @param {{
 *   title: string,
 *   description: string,
 *   location: string,
 *   type: 'Remote'|'On-site'|'Hybrid',
 *   salary?: string,
 *   deadline?: string,
 *   requirements?: string,
 *   duration?: string,
 *   vacancies?: number,
 * }} payload
 */
export const createListing = (payload) =>
  API.post("/company/internships", payload).then((res) => res.data);

/**
 * Update an existing listing.
 */
export const updateListing = (id, payload) =>
  API.put(`/company/internships/${id}`, payload).then((res) => res.data);

/**
 * Soft-delete a listing.
 */
export const deleteListing = (id) =>
  API.delete(`/company/internships/${id}`).then((res) => res.data);

export default API;