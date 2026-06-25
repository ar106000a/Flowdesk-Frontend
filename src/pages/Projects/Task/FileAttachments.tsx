import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import api from "../../../lib/api";
import { useAuth } from "../../../hooks/UseAuth";
import { useToast } from "../../../hooks/UseToast";
import type { TaskAttachment } from "../../../types";
import styles from "./FileAttachments.module.css";

interface FileAttachmentsProps {
  taskId: string;
  projectId: string;
}

export function FileAttachments({ taskId, projectId }: FileAttachmentsProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/tasks/${taskId}`);
      setAttachments(res.data.data.attachments ?? []);
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  }, [projectId, taskId]);

  // Separate effects — fetch is data loading, no setState directly in effect body
  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast("File exceeds 10MB limit", "error");
      return;
    }

    setIsUploading(true);
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api.post(
        `/api/projects/${projectId}/tasks/${taskId}/attachments`,
        { fileName: file.name, fileType: file.type, fileData },
      );
      setAttachments((prev) => [...prev, res.data.data]);
      addToast("File uploaded.", "success");
    } catch (err) {
      if (axios.isAxiosError(err))
        addToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(attachmentId: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    try {
      await api.delete(
        `/api/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
      );
    } catch {
      fetchAttachments();
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>// Attachments</p>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "+ Attach File"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
      </div>
      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : attachments.length === 0 ? (
          <p className={styles.empty}>No attachments.</p>
        ) : (
          attachments.map((att) => (
            <div key={att.id} className={styles.item}>
              <a
                href={att.file_url}
                target="_blank"
                rel="noreferrer"
                className={styles.fileName}
              >
                {att.file_name}
              </a>
              <span className={styles.fileSize}>
                {formatSize(att.file_size)}
              </span>
              {user?.id === att.uploaded_by && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(att.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
