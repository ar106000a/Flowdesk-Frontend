import { useState, useEffect } from "react";
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
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "../Task/TaskModal";
import type { Task, TaskStatus, TaskUpdatedPayload } from "../../../types";
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
  const { socket, joinProject, leaveProject } = useSocket();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  // Socket room — join/leave only, no setState
  useEffect(() => {
    joinProject(projectId);
    return () => {
      leaveProject(projectId);
    };
  }, [projectId, joinProject, leaveProject]);

  // Data fetching — inline to avoid cascading renders
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        const res = await api.get(`/api/projects/${projectId}/tasks`);
        if (isMounted) {
          setTasks(res.data.data);
        }
      } catch (err) {
        if (isMounted && axios.isAxiosError(err)) {
          addToast("Failed to load tasks", "error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [projectId, addToast]);

  useEffect(() => {
    function onTaskCreated({ task }: { task: Task }) {
      setTasks((prev) => {
        if (prev.find((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    }
    function onTaskUpdated({ task }: TaskUpdatedPayload) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setSelectedTask((prev) => (prev?.id === task.id ? task : prev));
    }
    function onTaskDeleted({ taskId }: { taskId: string }) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask((prev) => (prev?.id === taskId ? null : prev));
    }

    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);
    return () => {
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
    };
  }, [socket]);

  function getColumnTasks(status: TaskStatus) {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
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

    const newStatus: TaskStatus =
      (COLUMNS.find((c) => c.id === overId)?.id as TaskStatus) ??
      tasks.find((t) => t.id === overId)?.status ??
      task.status;

    const columnTasks = tasks
      .filter((t) => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const overIndex = columnTasks.findIndex((t) => t.id === overId);
    let newPosition: number;

    if (columnTasks.length === 0) {
      newPosition = 0;
    } else if (overIndex === -1 || overIndex === columnTasks.length - 1) {
      newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;
    } else {
      const before = columnTasks[overIndex]?.position ?? 0;
      const after = columnTasks[overIndex + 1]?.position ?? before + 2000;
      newPosition = Math.floor((before + after) / 2);
    }

    try {
      await api.patch(`/api/projects/${projectId}/tasks/${taskId}`, {
        status: newStatus,
        position: newPosition,
      });
    } catch {
      addToast("Failed to move task. Refreshing...", "error");
      setIsLoading(true);
      try {
        const res = await api.get(`/api/projects/${projectId}/tasks`);
        setTasks(res.data.data);
      } finally {
        setIsLoading(false);
      }
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
    <>
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
              onTaskCreated={(task) => setTasks((prev) => [...prev, task])}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Only render modal when a task is selected */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t)),
            );
            setSelectedTask(updated);
          }}
          onDeleted={(taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
