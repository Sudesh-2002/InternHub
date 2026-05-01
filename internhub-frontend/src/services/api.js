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

export const getJobs = (params) =>
  API.get("/student/internships", { params });

export const applyJob = (formData) => {
  return axios.post(
    "http://127.0.0.1:8000/api/student/apply",
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ── Company: Internship Listings ──────────────────────────────────────────────

export const fetchCompanyListings = (params = {}) =>
  API.get("/company/internships", { params }).then((res) => res.data);

export const fetchListing = (id) =>
  API.get(`/company/internships/${id}`).then((res) => res.data);

export const createListing = (payload) =>
  API.post("/company/internships", payload).then((res) => res.data);

export const updateListing = (id, payload) =>
  API.put(`/company/internships/${id}`, payload).then((res) => res.data);

export const deleteListing = (id) =>
  API.delete(`/company/internships/${id}`).then((res) => res.data);

// ── Admin: Student Management ─────────────────────────────────────────────────

/**
 * Get all students with optional filters.
 * @param {{ search?: string, status?: string, page?: number }} params
 */
export const adminFetchStudents = (params = {}) =>
  API.get("/admin/students", { params }).then((res) => res.data);

/**
 * Get a single student's full profile.
 * @param {number} id
 */
export const adminFetchStudent = (id) =>
  API.get(`/admin/students/${id}`).then((res) => res.data);

/**
 * Update a student's account status.
 * @param {number} id
 * @param {{ status: 'active'|'suspended'|'inactive' }} payload
 */
export const adminUpdateStudentStatus = (id, payload) =>
  API.patch(`/admin/students/${id}/status`, payload).then((res) => res.data);

/**
 * Permanently delete a student account.
 * @param {number} id
 */
export const adminDeleteStudent = (id) =>
  API.delete(`/admin/students/${id}`).then((res) => res.data);

// ── Admin: Company Management ─────────────────────────────────────────────────

/**
 * Get all companies with optional filters.
 * @param {{ search?: string, status?: string, page?: number }} params
 */
export const adminFetchCompanies = (params = {}) =>
  API.get("/admin/companies", { params }).then((res) => res.data);

/**
 * Get a single company's full profile.
 * @param {number} id
 */
export const adminFetchCompany = (id) =>
  API.get(`/admin/companies/${id}`).then((res) => res.data);

/**
 * Update a company's verification status.
 * @param {number} id
 * @param {{ status: 'verified'|'suspended'|'rejected'|'pending', note?: string }} payload
 */
export const adminUpdateCompanyStatus = (id, payload) =>
  API.patch(`/admin/companies/${id}/status`, payload).then((res) => res.data);

/**
 * Permanently delete a company and its user account.
 * @param {number} id
 */
export const adminDeleteCompany = (id) =>
  API.delete(`/admin/companies/${id}`).then((res) => res.data);

// ── Admin: Company Verification Queue ────────────────────────────────────────

/**
 * Get all companies awaiting verification.
 * @param {{ page?: number }} params
 */
export const adminFetchVerifications = (params = {}) =>
  API.get("/admin/verifications", { params }).then((res) => res.data);

/**
 * Get a single company's verification detail.
 * @param {number} id  — company_profile id
 */
export const adminFetchVerification = (id) =>
  API.get(`/admin/verifications/${id}`).then((res) => res.data);

/**
 * Submit a verification decision.
 * @param {number} id  — company_profile id
 * @param {{ action: 'approve'|'reject'|'resubmit', note?: string }} payload
 */
export const adminReviewVerification = (id, payload) =>
  API.post(`/admin/verifications/${id}/review`, payload).then((res) => res.data);

export default API;