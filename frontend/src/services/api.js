// Axios API client setup
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (email, password, confirmPassword) =>
    api.post("/api/auth/signup", { email, password, confirmPassword }),

  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),

  getMe: () => api.get("/api/auth/me"),
};

// Workspace API calls
export const workspaceAPI = {
  getAll: () => api.get("/api/workspace"),

  getById: (id) => api.get(`/api/workspace/${id}`),

  createFile: (name, parentId, language, file = null) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("language", language || "text");
    if (parentId) {
      formData.append("parentId", parentId);
    }
    if (file) {
      formData.append("file", file);
    }

    return api.post("/api/workspace/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createFolder: (name, parentId) =>
    api.post("/api/workspace/folder", { name, parentId }),

  updateFile: (id, name, content = null, file = null) => {
    if (content !== null || file) {
      const formData = new FormData();
      if (name) {
        formData.append("name", name);
      }
      if (content !== null) {
        formData.append("content", content);
      }
      if (file) {
        formData.append("file", file);
      }

      return api.put(`/api/workspace/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return api.put(`/api/workspace/${id}`, { name });
  },

  delete: (id) => api.delete(`/api/workspace/${id}`),
};

// Health check
export const healthCheck = () => api.get("/health");

// Cat API
export const catAPI = {
  getRandomCat: () => api.get("/api/cat"),
};

export default api;
