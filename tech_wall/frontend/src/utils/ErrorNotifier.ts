export interface ErrorNotification {
  erro: string;
  detalhes?: string;
  mensagens?: string[];
  statusCode?: number;
  statusText?: string;
  requestPayload?: string;
}

type ErrorListener = (notification: ErrorNotification) => void;

class ErrorNotifierClass {
  private listener: ErrorListener | null = null;

  subscribe(listener: ErrorListener) {
    this.listener = listener;
  }

  unsubscribe() {
    this.listener = null;
  }

  show(notification: ErrorNotification) {
    if (this.listener) {
      this.listener(notification);
    }
  }
}

export const ErrorNotifier = new ErrorNotifierClass();
