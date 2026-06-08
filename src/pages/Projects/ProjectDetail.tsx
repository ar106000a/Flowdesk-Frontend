import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { KanbanBoard } from "./Kanban/KanbanBoard";
import type { Project } from "../../types";
import styles from "./ProjectDetail.module.css";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //   async function fetchProject() {
  //     try {
  //       const res = await api.get(`/api/projects/${projectId}`);
  //       setProject(res.data.data);
  //     } catch (err) {
  //       if (axios.isAxiosError(err)) {
  //         const status = err.response?.status;
  //         if (status === 403 || status === 404) {
  //           addToast("Project not found or access denied.", "error");
  //           navigate("/projects");
  //         } else {
  //           addToast("Failed to load project.", "error");
  //         }
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const res = await api.get(`/api/projects/${projectId}`);
        setProject(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 403 || status === 404) {
            addToast("Project not found or access denied.", "error");
            navigate("/projects");
          } else {
            addToast("Failed to load project.", "error");
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId, addToast, navigate]);
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project || !projectId) return null;

  return (
    <div className={styles.page}>
      {/* ── Project header ─────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {/* Color indicator */}
          <div
            className={styles.colorDot}
            style={{
              background: project.color,
              boxShadow: `0 0 8px ${project.color}`,
            }}
          />
          <div>
            <h2 className={styles.projectName}>{project.name}</h2>
            {project.client_name && (
              <p className={styles.clientName}>
                <span className={styles.clientLabel}>Client //</span>
                {project.client_name}
              </p>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {project.budget > 0 && (
            <div className={styles.readout}>
              <span className={styles.readoutLabel}>Budget</span>
              <span className={styles.readoutValue}>
                ${project.budget.toLocaleString()}
              </span>
            </div>
          )}
          <div className={styles.readout}>
            <span className={styles.readoutLabel}>Status</span>
            <span className={styles.readoutValue}>
              {project.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Kanban board ───────────────────────────────────── */}
      <KanbanBoard projectId={projectId} />
    </div>
  );
}
