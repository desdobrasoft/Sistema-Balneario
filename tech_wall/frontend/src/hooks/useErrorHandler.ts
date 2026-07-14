import { useCallback } from "react";
import { isAxiosError } from "axios";

import { ErrorNotifier } from "utils/ErrorNotifier";

/**
 * Hook utilitário para tratamento de erros não-API.
 *
 * Para erros de API (Axios), o interceptor em api.ts já exibe
 * a notificação automaticamente. Este hook é útil apenas para
 * erros locais ou de lógica que não passam pelo Axios.
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    // Se for erro Axios, o interceptor em api.ts já tratou
    if (isAxiosError(error)) return;

    // Para erros não-API, exibe via ErrorNotifier
    if (error instanceof Error) {
      ErrorNotifier.show({
        detalhes: error.stack,
        erro: error.message,
      });
    } else {
      ErrorNotifier.show({
        erro: String(error),
      });
    }
  }, []);

  return handleError;
};
