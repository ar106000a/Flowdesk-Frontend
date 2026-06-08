import { useState, useCallback, type ReactNode } from "react";
import { ToastContext,type Toast,type ToastType } from "./ToastContext";
import { ToastRenderer } from "../components/ui/Toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* ToastRenderer lives here so it's always mounted at the root level */}
      <ToastRenderer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
