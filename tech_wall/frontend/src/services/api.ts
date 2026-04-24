import axios from "axios";

import { API_BASE_URL, ENDPOINTS } from "config/endpoints";
import { useAuthStore } from "store/authStore";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de login ou refresh
    if (
      error.response?.status === 401 &&
      originalRequest.url !== ENDPOINTS.AUTH.LOGIN &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout, setSessionExpired } =
        useAuthStore.getState();

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
            {
              refresh_token: refreshToken,
            },
          );
          const { access_token, refresh_token } = res.data;
          setTokens(access_token, refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Falha total no refresh
          setSessionExpired(true);
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // Sem refresh token, expira direto
        setSessionExpired(true);
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
