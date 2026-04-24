import { createContext, type ReactNode } from "react";

export interface DialogOptions {
  title: string;
  body: string | ReactNode;
  actions: ReactNode[];
  dismissable?: boolean;
}

interface DialogContextData {
  showDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextData>(
  {} as DialogContextData
);

export default DialogContext;