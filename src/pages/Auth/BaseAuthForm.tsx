import { type ReactNode } from "react";
import styles from "./BaseAuthForm.module.css";

interface BaseAuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (e: { preventDefault: () => void }) => void;
  children: ReactNode;
  submitLabel: string;
  isLoading?: boolean;
  errorMessage?: string;
  footer?: ReactNode;
}

export function BaseAuthForm({
  title,
  subtitle,
  onSubmit,
  children,
  submitLabel,
  isLoading = false,
  errorMessage,
  footer,
}: BaseAuthFormProps) {
  return (
    <>
      {/* Form header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        {/* Field slot */}
        {children}

        {/* API-level error (wrong password, account not found, etc.) */}
        {errorMessage && (
          <div className={styles.apiError} role="alert">
            <span className={styles.apiErrorIcon}>!</span>
            {errorMessage}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? <span className={styles.spinner} /> : submitLabel}
        </button>
      </form>

      {footer && <div className={styles.footer}>{footer}</div>}
    </>
  );
}
