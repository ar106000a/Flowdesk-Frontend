import { useState } from "react";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { Modal } from "../../components/ui/Modal";
import type { Project } from "../../types";
import styles from "./CreateProjectModal.module.css";

// Project color swatches — like colored wire labels on hardware
const COLOR_OPTIONS = [
  "#ff6600",
  "#33ff00",
  "#0088ff",
  "#ff3333",
  "#ffaa00",
  "#aa44ff",
  "#00ffcc",
  "#ff66aa",
];

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Project name is required";
    if (clientEmail && !/\S+@\S+\.\S+/.test(clientEmail))
      next.clientEmail = "Invalid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/projects", {
        name: name.trim(),
        description: description.trim() || undefined,
        client_name: clientName.trim() || undefined,
        client_email: clientEmail.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        color,
      });
      onCreated(res.data.data as Project);
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast(
          err.response?.data?.message || "Failed to create project",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setName("");
    setDescription("");
    setClientName("");
    setClientEmail("");
    setBudget("");
    setColor(COLOR_OPTIONS[0]);
    setErrors({});
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Initialize New Project"
      size="md"
      preventClose={isLoading}
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>
            Project Name <span className={styles.required}>*</span>
          </label>
          <input
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            type="text"
            placeholder="Mission codename"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Brief mission overview..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Client row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Client Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Client handle"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Client Email</label>
            <input
              className={`${styles.input} ${errors.clientEmail ? styles.inputError : ""}`}
              type="email"
              placeholder="client@domain.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            {errors.clientEmail && (
              <p className={styles.error}>{errors.clientEmail}</p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className={styles.field}>
          <label className={styles.label}>Budget (USD)</label>
          <input
            className={styles.input}
            type="number"
            placeholder="0.00"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Color picker */}
        <div className={styles.field}>
          <label className={styles.label}>Wire Color</label>
          <div className={styles.colorPicker}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorSwatch} ${color === c ? styles.colorActive : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              "Initialize Project"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
