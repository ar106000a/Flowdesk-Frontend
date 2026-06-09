import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import axios from "axios";
import api from "../../../lib/api";
import { useToast } from "../../../hooks/UseToast";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../../../types";
import styles from "./KanbanColumn.module.css";

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  projectId: string;
  onTaskClick: (task: Task) => void;
  onTaskCreated: (task: Task) => void;
}

export function KanbanColumn({
  id,
  label,
  color,
  tasks,
  projectId,
  onTaskCreated,
  onTaskClick,
}: KanbanColumnProps) {
  const { addToast } = useToast();

  const [isAdding, setIsAdding]     = useState(false);
  const [newTitle, setNewTitle]     = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useDroppable makes this column a valid drop target
  const { setNodeRef, isOver } = useDroppable({ id });

  async function handleAddTask(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/tasks`, {
        title: newTitle.trim(),
        status: id,
      });
      onTaskCreated(res.data.data as Task);
      setNewTitle("");
      setIsAdding(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast(err.response?.data?.message || "Failed to create task", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`${styles.column} ${isOver ? styles.columnOver : ""}`}>

      {/* ── Column header ──────────────────────────────────── */}
      <div className={styles.header}>
        {/* Status LED */}
        <span className={styles.led} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <h3 className={styles.title} style={{ color }}>
          {label}
        </h3>
        <span className={styles.count}>{tasks.length}</span>
        <button
          className={styles.addBtn}
          onClick={() => setIsAdding(true)}
          type="button"
          aria-label="Add task"
        >
          +
        </button>
      </div>

      {/* ── Drop zone + task list ───────────────────────────── */}
      <div
        ref={setNodeRef}
        className={`${styles.taskList} ${isOver ? styles.taskListOver : ""}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isAdding && (
          <div className={styles.emptySlot}>
            <span>Drop tasks here</span>
          </div>
        )}
      </div>

      {/* ── Quick add form ──────────────────────────────────── */}
      {isAdding && (
        <form onSubmit={handleAddTask} className={styles.addForm}>
          <input
            className={styles.addInput}
            type="text"
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            disabled={isSubmitting}
          />
          <div className={styles.addActions}>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={isSubmitting || !newTitle.trim()}
            >
              {isSubmitting ? "..." : "Add"}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => { setIsAdding(false); setNewTitle(""); }}
            >
              ✕
            </button>
          </div>
        </form>
      )}
    </div>
  );
}