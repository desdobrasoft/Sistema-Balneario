import { useContext } from "react";

import SnackbarContext from "contexts/SnackbarContext";

/**
 * Hook utilitário para disparar notificações Snackbar em qualquer lugar do frontend.
 *
 * Exemplo de uso:
 * const { showSnackbar } = useSnackbar();
 * showSnackbar({ title: 'Sucesso', message: 'Item salvo', severity: 'success' });
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar deve ser usado dentro de um SnackbarProvider");
  }

  return context;
};
