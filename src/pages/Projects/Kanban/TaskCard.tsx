import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../../types";
import styles from "./TaskCard.module.css";

const PRIORITY_COLOR: Record<string, string> = {
  low:    "var(--hw-text-dim)",
  medium: "var(--hw-accent-info)",
  high:   "#ffaa00",
  urgent: "var(--hw-accent-danger)",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "LOW", medium: "MED", high: "HI", urgent: "URG",
};

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging = false, onClick }: TaskCardProps) {
  // useSortable gives us drag handle props + transform styles
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = PRIORITY_COLOR[task.priority] ?? "var(--hw-text-dim)";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        isSortableDragging || isDragging ? styles.dragging : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Priority wire strip on left */}
      <div
        className={styles.priorityStrip}
        style={{ background: priorityColor }}
      />

      <div className={styles.body}>
        <p className={styles.title}>{task.title}</p>

        {task.description && (
          <p className={styles.desc}>{task.description}</p>
        )}

        <div className={styles.footer}>
          {/* Priority badge */}
          <span
            className={styles.priorityBadge}
            style={{ color: priorityColor, borderColor: priorityColor }}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span className={styles.dueDate}>
              {new Date(task.due_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}