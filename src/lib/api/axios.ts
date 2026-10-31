
import axios from "axios";

const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? (process.env.API_BASE_URL ?? "http://localhost:8000/api/v1")
      : "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
