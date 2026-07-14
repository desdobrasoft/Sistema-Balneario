import axios, { isAxiosError } from "axios";

import { API_BASE_URL } from "config/endpoints";
import { useAuthStore } from "store/authStore";
import { ErrorNotifier } from "utils/ErrorNotifier";

interface BackendSuccessResponse {
  data: unknown;
  success: true;
}

interface BackendErrorResponse {
  detalhes?: string;
  erro: string;
  mensagens?: string[];
  statusCode: number;
  success: false;
}

function isBackendSuccessResponse(
  value: unknown,
): value is BackendSuccessResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as BackendSuccessResponse).success === true
  );
}

function isBackendErrorResponse(value: unknown): value is BackendErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as BackendErrorResponse).success === false &&
    "erro" in value
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Garante envio de cookies HttpOnly
});

api.interceptors.response.use(
  (response) => {
    // Unwrap backend success envelope: { success: true, data: ... } → data
    if (isBackendSuccessResponse(response.data)) {
      if ("data" in response.data) {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Token expiration ou Unauthorized
    if (
      error.response?.status === 401 &&
      !(originalRequest as unknown as Record<string, unknown> | undefined)
        ?._retry
    ) {
      if (originalRequest) {
        (originalRequest as unknown as Record<string, unknown>)._retry = true;
      }
      const { logout, setSessionExpired } = useAuthStore.getState();
      
      // Com cookies, se der 401, a sessão morreu/expirou (não há mais fluxo manual de refresh)
      setSessionExpired(true);
      logout();
    }

    // Extract and show error notification
    const responseData = error.response?.data;

    let requestPayload: string | undefined;
    if (error.config?.data != null) {
      requestPayload =
        typeof error.config.data === "string"
          ? error.config.data
          : JSON.stringify(error.config.data);
    }

    if (isBackendErrorResponse(responseData)) {
      ErrorNotifier.show({
        detalhes: responseData.detalhes,
        erro: responseData.erro,
        mensagens: responseData.mensagens,
        requestPayload,
        statusCode: responseData.statusCode ?? error.response?.status,
        statusText: error.response?.statusText,
      });
    } else if (error.response) {
      // Non-standard error response
      ErrorNotifier.show({
        erro: error.message || "Erro inesperado do servidor",
        requestPayload,
        statusCode: error.response.status,
        statusText: error.response.statusText,
      });
    } else {
      // Network error (no response)
      ErrorNotifier.show({
        erro: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
