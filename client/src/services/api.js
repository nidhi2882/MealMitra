import axios from "axios";

// Every other file talks to the backend through THIS instance only —
// never import axios directly in a page/component. That keeps the
// base URL and auth header logic in exactly one place.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Runs before every request this instance sends. Reads the token from
// localStorage and attaches it — so individual pages never have to
// remember to do this themselves.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("mealmitra_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Runs after every response. If the backend ever says the token is
// invalid/expired (401), clear it and bounce to login — instead of every
// page having to check this individually.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("mealmitra_token");
            localStorage.removeItem("mealmitra_user");
            // Full redirect (not react-router navigate) since this can fire
            // outside any component's render — simplest reliable way to bounce out.
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;