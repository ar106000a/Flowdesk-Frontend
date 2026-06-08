import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import axios from "axios";
import api from "../../../lib/api";
import { useSocket } from "../../../hooks/UseSocket";
import { useToast } from "../../../hooks/UseToast";
import { KanbanColumn } from "./KanbanColumn.tsx";
import { TaskCard } from "./TaskCard.tsx";
import type { Task, TaskStatus } from "../../../types";
import styles from "./KanbanBoard.module.css";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "var(--hw-text-dim)" },
  { id: "in_progress", label: "In Progress", color: "var(--hw-accent-info)" },
  { id: "review", label: "Review", color: "#ffaa00" },
  { id: "done", label: "Done", color: "var(--hw-accent-lcd)" },
];

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { joinProject, leaveProject } = useSocket();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // ─── Sensors — mouse needs 8px move before drag starts (prevents mis-clicks)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  // ─── Load tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      setTasks(res.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast("Failed to load tasks", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, addToast]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/projects/${projectId}/tasks`);
        setTasks(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          addToast("Failed to load tasks", "error");
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId, addToast]);

  useEffect(() => {
    joinProject(projectId);
    return () => {
      leaveProject(projectId);
    };
  }, [projectId, joinProject, leaveProject]);

  // ─── Tasks grouped by status ─────────────────────────────────────────────────
  function getColumnTasks(status: TaskStatus) {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  // ─── Drag handlers ───────────────────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  // DragOver gives live visual feedback while dragging over a column
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // overId is either a column id (status) or a task id
    const targetStatus =
      COLUMNS.find((c) => c.id === overId)?.id ??
      tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: targetStatus } : t)),
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine new status — over could be column or task
    const newStatus: TaskStatus =
      (COLUMNS.find((c) => c.id === overId)?.id as TaskStatus) ??
      tasks.find((t) => t.id === overId)?.status ??
      task.status;

    // Calculate new position
    const columnTasks = tasks
      .filter((t) => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const overIndex = columnTasks.findIndex((t) => t.id === overId);
    let newPosition: number;

    if (columnTasks.length === 0) {
      newPosition = 0;
    } else if (overIndex === -1 || overIndex === columnTasks.length - 1) {
      // Dropped at end
      newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;
    } else {
      // Dropped between two tasks — midpoint
      const before = columnTasks[overIndex]?.position ?? 0;
      const after = columnTasks[overIndex + 1]?.position ?? before + 2000;
      newPosition = Math.floor((before + after) / 2);
    }

    // Optimistic update already applied in handleDragOver
    // Now persist to backend
    try {
      await api.patch(`/api/projects/${projectId}/tasks/${taskId}`, {
        status: newStatus,
        position: newPosition,
      });
    } catch {
      // Rollback on failure
      addToast("Failed to move task. Refreshing...", "error");
      fetchTasks();
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            tasks={getColumnTasks(col.id)}
            projectId={projectId}
            onTaskCreated={(task: Task) => setTasks((prev) => [...prev, task])}
          />
        ))}
      </div>

      {/* DragOverlay renders the card being dragged at cursor position */}
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
