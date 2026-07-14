import { createContext, type ReactNode } from "react";

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarOptions {
  title?: string;
  message: string;
  severity?: SnackbarSeverity;
  autoHideDuration?: number;
  action?: ReactNode;
  onClose?: () => void;
}

interface SnackbarContextData {
  showSnackbar: (options: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextData>(
  {} as SnackbarContextData
);

export default SnackbarContext;
