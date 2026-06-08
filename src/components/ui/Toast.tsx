import type { Toast } from "../../context/ToastContext";
import styles from "./Toast.module.css";

const ICONS: Record<Toast["type"], string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

interface ToastRendererProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastRenderer({ toasts, onRemove }: ToastRendererProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.container}
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.icon}>{ICONS[toast.type]}</span>
          <p className={styles.message}>{toast.message}</p>
          <button
            className={styles.dismiss}
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
