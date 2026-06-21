import axios from "axios";
import { clearSession, getToken } from "./session";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api"
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        const payload = response?.data;
        if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
            return payload.data;
        }
        return payload;
    },
    (error) => {
        if (error?.response?.status === 401) {
            clearSession();

            if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
