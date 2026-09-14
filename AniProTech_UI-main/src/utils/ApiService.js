// src/api/axiosClient.js
import axios from "axios";
import { decryptData } from "./cryptoHelpers";
import { showError } from "./toaster";

const BASE_URL = import.meta.env.VITE_APP_BASE_LIVE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Attach Authorization header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token && !["/api/auth/get-token", "/api/auth/request-link"].includes(config.url)) {
            try {
                const eData = decryptData(token);
                config.headers.Authorization = `Bearer ${eData}`;
            } catch {
                localStorage.removeItem("access_token");
                localStorage.removeItem("userInfo");
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Global response handler
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        return Promise.reject(error);
    },
);

// Export core methods
export const _get = (url, config = {}) => apiClient.get(url, config);
export const _post = (url, data = {}, config = {}) => apiClient.post(url, data, config);
export const _postForm = (url, data, config = {}) =>
    apiClient.post(url, data, {
        ...config,
        headers: {
            ...(config.headers || {}),
            "Content-Type": "multipart/form-data",
        },
    });
export const _put = (url, data = {}, config = {}) => apiClient.put(url, data, config);
export const _putForm = (url, data = {}, config = {}) =>
  apiClient.put(url, data, {
    ...config,
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  });


export const _delete = (url, data = {}, config = {}) => apiClient.delete(url, { ...config, data });
export const _deleteWithBody = (url, data = {}, config = {}) => apiClient.delete(url, { ...config, data });
