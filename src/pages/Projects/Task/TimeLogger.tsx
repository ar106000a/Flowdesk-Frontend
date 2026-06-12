import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../lib/api";
import { useToast } from "../../../hooks/UseToast";
import { useAuth } from "../../../hooks/UseAuth";
import { useSocket } from "../../../hooks/UseSocket";
import type { TimeLog } from "../../../types";
import styles from "./TimeLogger.module.css";

interface TimeLoggerProps {
  taskId: string;
  projectId: string;
}

export function TimeLogger({ taskId, projectId }: TimeLoggerProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket();

  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const [loggedAt, setLoggedAt] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/api/projects/${projectId}/tasks/${taskId}/time`,
        );
        if (isMounted) {
          setLogs(res.data.data);
        }
      } catch {
        if (isMounted) {
          addToast("Failed to fetch", "error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [taskId, projectId, addToast]);

  // Real-time updates
  useEffect(() => {
    function onLogged({
      timeLog,
      taskId: tid,
    }: {
      timeLog: TimeLog;
      taskId: string;
    }) {
      if (tid !== taskId) return;
      setLogs((prev) => {
        if (prev.find((l) => l.id === timeLog.id)) return prev;
        return [timeLog, ...prev];
      });
    }
    function onDeleted({
      timeLogId,
      taskId: tid,
    }: {
      timeLogId: string;
      taskId: string;
    }) {
      if (tid !== taskId) return;
      setLogs((prev) => prev.filter((l) => l.id !== timeLogId));
    }

    socket.on("time:logged", onLogged);
    socket.on("time:deleted", onDeleted);
    return () => {
      socket.off("time:logged", onLogged);
      socket.off("time:deleted", onDeleted);
    };
  }, [socket, taskId]);

  function resetForm() {
    setHours("");
    setMinutes("");
    setDescription("");
    setBillable(true);
    setLoggedAt(new Date().toISOString().split("T")[0]);
    setIsAdding(false);
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const totalMinutes = h * 60 + m;

    if (totalMinutes <= 0) {
      addToast("Enter a duration greater than 0", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/tasks/${taskId}/time`, {
        minutes: totalMinutes,
        description: description.trim() || undefined,
        logged_at: loggedAt,
        billable,
      });
      // setLogs((prev) => [res.data.data, ...prev]);
      resetForm();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast(err.response?.data?.message || "Failed to log time", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(logId: string) {
    const originalLogs = logs;
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    try {
      await api.delete(
        `/api/projects/${projectId}/tasks/${taskId}/time/${logId}`,
      );
    } catch (err: unknown) {
      setLogs(originalLogs);
      addToast("Could not delete logs. Server Error!");
      console.log(err);
    }
  }

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
  const billableMinutes = logs
    .filter((l) => l.billable)
    .reduce((sum, l) => sum + l.minutes, 0);

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>// Time Logged</p>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setIsAdding((prev) => !prev)}
        >
          {isAdding ? "Cancel" : "+ Log Time"}
        </button>
      </div>

      {/* Totals readout */}
      {!isLoading && logs.length > 0 && (
        <div className={styles.totals}>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>
              {formatDuration(totalMinutes)}
            </span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Billable</span>
            <span className={styles.totalValueBillable}>
              {formatDuration(billableMinutes)}
            </span>
          </div>
        </div>
      )}

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.durationRow}>
            <div className={styles.durationField}>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={styles.durationInput}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <span className={styles.durationUnit}>hrs</span>
            </div>
            <div className={styles.durationField}>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                className={styles.durationInput}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
              <span className={styles.durationUnit}>min</span>
            </div>
            <input
              type="date"
              className={styles.dateInput}
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="What did you work on? (optional)"
            className={styles.descInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className={styles.formFooter}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className={styles.checkbox}
              />
              Billable
            </label>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging..." : "Log Time"}
            </button>
          </div>
        </form>
      )}

      {/* Log list */}
      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : logs.length === 0 ? (
          <p className={styles.empty}>No time logged yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logMain}>
                <span className={styles.logDuration}>
                  {formatDuration(log.minutes)}
                </span>
                {log.description && (
                  <span className={styles.logDesc}>{log.description}</span>
                )}
              </div>
              <div className={styles.logMeta}>
                <span className={styles.logDate}>
                  {new Date(log.logged_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {log.billable && <span className={styles.billableTag}>$</span>}
                {user?.id === log.user_id && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(log.id)}
                    type="button"
                    aria-label="Delete time log"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
