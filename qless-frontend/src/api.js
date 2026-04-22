// In development:  uses Vite proxy → http://localhost:5000/api
// In production:   uses VITE_API_URL env var set by Render
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export const api = {
  _token: null,
  setToken(t) { this._token = t; t ? localStorage.setItem("ql_token", t) : localStorage.removeItem("ql_token"); },
  getToken() { return this._token || localStorage.getItem("ql_token"); },

  async request(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res  = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || "Something went wrong");
    return data;
  },

  get:    (path)       => api.request("GET",    path),
  post:   (path, body) => api.request("POST",   path, body),
  delete: (path)       => api.request("DELETE", path),
  patch:  (path, body) => api.request("PATCH",  path, body),
};
