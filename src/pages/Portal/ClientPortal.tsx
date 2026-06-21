import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { Task, TaskStatus, Invoice } from "../../types";
import styles from "./ClientPortal.module.css";

interface PortalData {
  project: {
    id: string;
    name: string;
    description: string | null;
    client_name: string | null;
    status: string;
    color: string;
  };
  tasks: Pick<Task, "id" | "title" | "status" | "priority" | "due_date">[];
  invoices: Pick<
    Invoice,
    | "id"
    | "invoice_number"
    | "status"
    | "total"
    | "currency"
    | "due_date"
    | "pdf_url"
  >[];
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export default function ClientPortal() {
  const { token } = useParams<{ token: string }>();

  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchPortalData();
  }, [token]);

  async function fetchPortalData() {
    try {
      // Public route — no api.ts instance needed, no auth header
      const res = await axios.get(`/app/portal/${token}`);
      setData(res.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "This link is invalid or has expired.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className={styles.spinner} />
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <div className={styles.errorIcon}>⚠</div>
          <h2>Access Denied</h2>
          <p>{error || "This portal link is no longer valid."}</p>
        </div>
      </div>
    );
  }

  const { project, tasks, invoices } = data;

  const tasksByStatus = (
    ["todo", "in_progress", "review", "done"] as TaskStatus[]
  ).map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }));

  const totalDue = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>FD</div>
          <span className={styles.brandText}>FLOWDESK</span>
        </div>
        <span className={styles.portalTag}>Client Portal</span>
      </div>

      {/* Project info */}
      <div className={styles.projectCard}>
        <div className={styles.projectTop}>
          <div
            className={styles.colorDot}
            style={{
              background: project.color,
              boxShadow: `0 0 8px ${project.color}`,
            }}
          />
          <h1 className={styles.projectName}>{project.name}</h1>
        </div>
        {project.description && (
          <p className={styles.projectDesc}>{project.description}</p>
        )}
        {totalDue > 0 && (
          <div className={styles.dueBanner}>
            <span>Outstanding Balance</span>
            <span className={styles.dueAmount}>
              {invoices[0]?.currency || "USD"}{" "}
              {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>// Project Progress</h2>
        <div className={styles.taskColumns}>
          {tasksByStatus.map(({ status, tasks: colTasks }) => (
            <div key={status} className={styles.taskCol}>
              <div className={styles.taskColHeader}>
                <span>{STATUS_LABEL[status]}</span>
                <span className={styles.taskCount}>{colTasks.length}</span>
              </div>
              <div className={styles.taskList}>
                {colTasks.length === 0 ? (
                  <p className={styles.emptyTasks}>—</p>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className={styles.taskItem}>
                      <span
                        className={`${styles.priorityDot} ${styles[`priority_${task.priority}`]}`}
                      />
                      <span className={styles.taskTitle}>{task.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>// Invoices</h2>
        {invoices.length === 0 ? (
          <p className={styles.emptyState}>No invoices yet.</p>
        ) : (
          <div className={styles.invoiceList}>
            {invoices.map((invoice) => (
              <div key={invoice.id} className={styles.invoiceRow}>
                <div className={styles.invoiceMain}>
                  <span className={styles.invoiceNumber}>
                    {invoice.invoice_number}
                  </span>
                  <span
                    className={`${styles.invoiceStatus} ${styles[`status_${invoice.status}`]}`}
                  >
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.invoiceRight}>
                  <span className={styles.invoiceAmount}>
                    {invoice.currency}{" "}
                    {invoice.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  {invoice.pdf_url && (
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.pdfLink}
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>Powered by Flowdesk</div>
    </div>
  );
}
