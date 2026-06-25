import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon = "◈",
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.title}>{title}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {action && (
        <button className={styles.btn} onClick={action.onClick} type="button">
          {action.label}
        </button>
      )}
    </div>
  );
}
