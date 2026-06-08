import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { CreateProjectModal } from "./CreateProjectModal.tsx";
import type { Project } from "../../types";
import styles from "./Projects.module.css";

export default function Projects() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      try {
        const res = await api.get("/api/projects", {
          signal: abortController.signal,
        });
        setProjects(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && !abortController.signal.aborted) {
          addToast(
            err.response?.data?.message || "Failed to load projects",
            "error",
          );
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [addToast]);
  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
    addToast(`Project "${project.name}" initialized.`, "success");
  }

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.spinner} />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>// Projects</h2>
          <p className={styles.pageSubtitle}>
            {projects.length} active mission{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
          type="button"
        >
          + New Project
        </button>
      </div>

      {/* ── Empty state ──────────────────────────────────────── */}
      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>◈</div>
          <p className={styles.emptyTitle}>No projects initialized</p>
          <p className={styles.emptySubtitle}>
            Create your first project to get started
          </p>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreate(true)}
            type="button"
          >
            + Initialize First Project
          </button>
        </div>
      ) : (
        /* ── Project grid ─────────────────────────────────────── */
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const statusColor: Record<string, string> = {
    active: "var(--hw-accent-lcd)",
    completed: "#888",
    archived: "var(--hw-text-dim)",
  };

  return (
    <button className={styles.card} onClick={onClick} type="button">
      {/* Color strip — like a colored wire on hardware */}
      <div className={styles.cardStrip} style={{ background: project.color }} />

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h3 className={styles.cardName}>{project.name}</h3>
          <span
            className={styles.cardStatus}
            style={{
              color: statusColor[project.status] ?? "var(--hw-text-dim)",
            }}
          >
            {project.status.toUpperCase()}
          </span>
        </div>

        {project.client_name && (
          <p className={styles.cardClient}>
            <span className={styles.cardLabel}>Client</span>
            {project.client_name}
          </p>
        )}

        {project.description && (
          <p className={styles.cardDesc}>{project.description}</p>
        )}

        <div className={styles.cardFooter}>
          {project.budget > 0 && (
            <span className={styles.cardBudget}>
              ${project.budget.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
