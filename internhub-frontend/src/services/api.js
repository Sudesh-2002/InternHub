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

// ── Profile ───────────────────────────────────────────────────────────────────

export const fetchProfile = () =>
  API.get("/profile").then((res) => res.data);

export const updateProfile = (payload) =>
  API.put("/profile", payload).then((res) => res.data);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  return API.post("/profile/resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // override for file upload
    },
  }).then((res) => res.data);
};

export const deleteResume = () =>
  API.delete("/profile/resume").then((res) => res.data);

export default API;