import { type InputHTMLAttributes } from "react";
import styles from "./AuthField.module.css";
import { Input } from "../../components/ui/Input";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthField({ label, error, id, ...rest }: AuthFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {rest.required && <span className={styles.required}> *</span>}
      </label>
      <Input
        id={fieldId}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        {...rest}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
