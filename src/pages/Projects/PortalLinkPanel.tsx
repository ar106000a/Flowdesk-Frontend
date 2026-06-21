import { useState } from "react";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import type { Project } from "../../types";
import styles from "./PortalLinkPanel.module.css";

interface PortalLinkPanelProps {
  project: Project;
  onUpdate: (portalToken: string | null) => void;
}

export function PortalLinkPanel({ project, onUpdate }: PortalLinkPanelProps) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const portalUrl = project.portal_token
    ? `${window.location.origin}/portal/${project.portal_token}`
    : null;

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await api.post(`/api/projects/${project.id}/portal/generate`);
      onUpdate(res.data.data.portal_token);
      addToast("Client portal link generated.", "success");
    } catch (err) {
      if (axios.isAxiosError(err))
        addToast(
          err.response?.data?.message || "Failed to generate link",
          "error",
        );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevoke() {
    if (
      !confirm(
        "Revoke this portal link? The current link will stop working immediately.",
      )
    )
      return;
    setIsRevoking(true);
    try {
      await api.post(`/api/projects/${project.id}/portal/revoke`);
      onUpdate(null);
      addToast("Portal link revoked.", "info");
    } catch (err) {
      if (axios.isAxiosError(err))
        addToast(
          err.response?.data?.message || "Failed to revoke link",
          "error",
        );
    } finally {
      setIsRevoking(false);
    }
  }

  function handleCopy() {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>// Client Portal</span>
        {portalUrl && <span className={styles.statusDot} />}
      </div>

      {portalUrl ? (
        <div className={styles.linkRow}>
          <input
            className={styles.linkInput}
            value={portalUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className={styles.copyBtn} onClick={handleCopy} type="button">
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            className={styles.revokeBtn}
            onClick={handleRevoke}
            disabled={isRevoking}
            type="button"
          >
            {isRevoking ? "..." : "Revoke"}
          </button>
        </div>
      ) : (
        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={isGenerating}
          type="button"
        >
          {isGenerating ? "Generating..." : "Generate Client Link"}
        </button>
      )}

      <p className={styles.hint}>
        Share this link with your client to give them read-only access to
        project tasks and invoices — no login required.
      </p>
    </div>
  );
}
