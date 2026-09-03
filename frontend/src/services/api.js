//frontend/src/services/services/api
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message?.toLowerCase() || "";

    if (
      status === 401 ||
      (status === 403 && (msg.includes("token") || msg.includes("expired") || msg.includes("access required")))
    ) {
      // Clear expired credentials
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Only redirect if not already on login or signup
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;