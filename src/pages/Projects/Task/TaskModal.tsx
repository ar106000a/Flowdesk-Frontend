import { useState } from "react";
import axios from "axios";
import api from "../../../lib/api";
import { useToast } from "../../../hooks/UseToast";
import { Modal } from "../../../components/ui/Modal";
import { TaskComments } from "./TaskComments";
import type { Task, TaskStatus, TaskPriority } from "../../../types";
import styles from "./TaskModal.module.css";
import { TimeLogger } from "./TimeLogger";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface TaskModalProps {
  task: Task;
  projectId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}

export function TaskModal({
  task,

  projectId,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: TaskModalProps) {
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize state directly from the task prop values
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium",
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");

  // 1. Store the previous task to track modifications / transitions
  const [prevTask, setPrevTask] = useState(task);

  // 2. Adjust state conditionally during render to avoid cascading effect renders
  if (task !== prevTask) {
    setPrevTask(task);
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? "todo");
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.due_date ?? "");
    setIsEditing(false);
  }

  if (!task) return null;

  async function handleSave() {
    if (!title.trim()) {
      addToast("Title is required", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.patch(
        `/api/projects/${projectId}/tasks/${task.id}`,
        {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          due_date: dueDate || null,
        },
      );
      const updated = res.data.data as Task;
      onUpdated(updated);
      setIsEditing(false);
      addToast("Task updated.", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast(
          err.response?.data?.message || "Failed to update task",
          "error",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/projects/${projectId}/tasks/${task.id}`);
      onDeleted(task.id);
      onClose();
      addToast("Task deleted.", "info");
    } catch {
      addToast("Failed to delete task.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancel() {
    // Reset to task's current values
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.due_date ?? "");
    setIsEditing(false);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Task Detail"}
      size="lg"
      preventClose={isSaving}
    >
      <div className={styles.layout}>
        {/* ── Left: task info ─────────────────────────────── */}
        <div className={styles.main}>
          {/* Title */}
          {isEditing ? (
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          ) : (
            <h3 className={styles.title}>{task.title}</h3>
          )}

          {/* Meta row — status + priority + due date */}
          <div className={styles.metaRow}>
            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Status</span>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`${styles.badge} ${styles[`status_${task.status}`]}`}
                >
                  {STATUS_OPTIONS.find((o) => o.value === task.status)?.label}
                </span>
              )}
            </div>

            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Priority</span>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`${styles.badge} ${styles[`priority_${task.priority}`]}`}
                >
                  {
                    PRIORITY_OPTIONS.find((o) => o.value === task.priority)
                      ?.label
                  }
                </span>
              )}
            </div>

            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Due Date</span>
              {isEditing ? (
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              ) : (
                <span className={styles.metaValue}>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Description */}
          <div className={styles.descSection}>
            <p className={styles.metaLabel}>// Description</p>
            {isEditing ? (
              <textarea
                className={styles.descInput}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={5}
              />
            ) : (
              <p className={styles.descText}>
                {task.description || (
                  <span className={styles.empty}>No description</span>
                )}
              </p>
            )}
          </div>

          {/* Time logging — hidden while editing task details */}
          {!isEditing && (
            <>
              <div className={styles.divider} />
              <TimeLogger taskId={task.id} projectId={projectId} />
            </>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Right: comments ─────────────────────────────── */}
        <div className={styles.sidebar}>
          <TaskComments taskId={task.id} projectId={projectId} />
        </div>
      </div>
    </Modal>
  );
}
