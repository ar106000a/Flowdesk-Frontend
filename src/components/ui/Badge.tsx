import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "low"
  | "medium"
  | "high"
  | "urgent";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  dot = false,
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

// ─── Convenience helpers so call sites are readable ────────────────────────
// Usage: <TaskStatusBadge status={task.status} />
// Instead of: <Badge variant={task.status}>In Progress</Badge>

import type { TaskStatus, TaskPriority } from "../../types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={status} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant={priority}>{PRIORITY_LABEL[priority]}</Badge>;
}
