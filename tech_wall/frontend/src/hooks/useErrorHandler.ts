import { isAxiosError } from "axios";
import { useCallback } from "react";

import { useSnackbar } from "./useSnackbar";

/**
 * Hook utilitário para tratamento padronizado de erros em toda a aplicação.
 *
 * Extrai automaticamente mensagens de erro de respostas Axios (incluindo arrays
 * de validação do NestJS), erros nativos e objetos genéricos, exibindo-os via
 * Snackbar com detalhes completos quando disponíveis.
 *
 * Exemplo de uso:
 * const handleError = useErrorHandler();
 *
 * ```typescript
 * try { ... }
 * catch (error) { handleError(error); }
 * ```
 */
export const useErrorHandler = () => {
  const { showSnackbar } = useSnackbar();

  const handleError = useCallback(
    (error: unknown) => {
      if (isAxiosError(error)) {
        const data = error.response?.data as any;
        const status = error.response?.status;
        const statusText = error.response?.statusText || "Erro";

        // NestJS retorna { message: string | string[], error: string, statusCode: number }
        const rawMessage = data?.message;
        const errorLabel = data?.error || statusText;

        // Se message for array (validação class-validator), mostra cada item como detalhe
        if (Array.isArray(rawMessage)) {
          showSnackbar({
            title: `${errorLabel} (${status})`,
            message: `A requisição retornou ${rawMessage.length} erro(s) de validação.`,
            severity: "error",
            details: rawMessage.map(String),
            autoHideDuration: 10000,
          });
        } else {
          showSnackbar({
            title: `${errorLabel} (${status})`,
            message: String(rawMessage || error.message),
            severity: "error",
            autoHideDuration: 8000,
          });
        }
      } else if (error instanceof Error) {
        showSnackbar({
          title: error.name,
          message: error.message,
          severity: "error",
        });
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        showSnackbar({
          title: "Erro",
          message: String((error as any).message),
          severity: "error",
        });
      } else {
        showSnackbar({
          title: "Erro Inesperado",
          message: String(error),
          severity: "error",
        });
      }
    },
    [showSnackbar],
  );

  return handleError;
};
