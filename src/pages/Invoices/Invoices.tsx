import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { Invoice } from "../../types";
import styles from "./Invoices.module.css";

export default function Invoices() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "overdue"
  >("all");

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await api.get("/api/invoices");
        setInvoices(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          addToast(
            err.response?.data?.message || "Failed to load invoices",
            "error",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, [addToast]);
  const filtered = invoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  // ─── Summary totals ──────────────────────────────────────────────────────
  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const totalDraft = invoices.filter((i) => i.status === "draft").length;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>// Invoices</h2>
          <p className={styles.pageSubtitle}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} across
            all projects
          </p>
        </div>
      </div>

      {/* Summary readouts */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Outstanding</span>
          <span className={styles.summaryValue}>
            $
            {totalOutstanding.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Paid (Total)</span>
          <span className={`${styles.summaryValue} ${styles.summaryPaid}`}>
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Drafts</span>
          <span className={styles.summaryValue}>{totalDraft}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>◎</div>
          <p className={styles.emptyTitle}>
            {filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
          </p>
          <p className={styles.emptySubtitle}>
            Create an invoice from inside a project to get started
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((invoice) => (
            <button
              key={invoice.id}
              className={styles.row}
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              type="button"
            >
              {/* Project color strip */}
              <div
                className={styles.colorStrip}
                style={{ background: invoice.project?.color || "#555" }}
              />

              <div className={styles.rowMain}>
                <div className={styles.rowTop}>
                  <span className={styles.invoiceNumber}>
                    {invoice.invoice_number}
                  </span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.clientName}>
                    {invoice.client_name}
                  </span>
                  {invoice.project?.name && (
                    <>
                      <span className={styles.metaDivider}>//</span>
                      <span className={styles.projectName}>
                        {invoice.project.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.rowRight}>
                <span className={styles.amount}>
                  {invoice.currency}{" "}
                  {invoice.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {invoice.due_date && (
                  <span className={styles.dueDate}>
                    Due{" "}
                    {new Date(invoice.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
