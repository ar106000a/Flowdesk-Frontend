import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import styles from "./Input.module.css";

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

// forwardRef lets parent components pass a ref to the actual <input> element
// This is needed for things like auto-focusing fields in modals
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      className = "",
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {rest.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={`${styles.inputWrap} ${error ? styles.hasError : ""}`}>
          {leftElement && (
            <span className={styles.leftElement}>{leftElement}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${leftElement ? styles.hasLeft : ""} ${rightElement ? styles.hasRight : ""} ${className}`}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...rest}
          />
          {rightElement && (
            <span className={styles.rightElement}>{rightElement}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {rest.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${styles.textarea} ${error ? styles.hasError : ""} ${className}`}
          aria-invalid={!!error}
          {...rest}
        />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
