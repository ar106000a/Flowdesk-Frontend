import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { Invoice } from "../../types";
import styles from "./InvoiceDetail.module.css";

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => { if (invoiceId) fetchInvoice(); }, [invoiceId]);

  async function fetchInvoice() {
    try {
      const res = await api.get(`/api/invoices/${invoiceId}`);
      setInvoice(res.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast("Invoice not found", "error");
        navigate("/invoices");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    if (!invoiceId) return;
    setIsSending(true);
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/send`);
      setInvoice(res.data.data);
      addToast("Invoice sent to client.", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) addToast(err.response?.data?.message || "Failed to send invoice", "error");
    } finally {
      setIsSending(false);
    }
  }

  async function handleMarkPaid() {
    if (!invoiceId || !confirm("Mark this invoice as paid?")) return;
    setIsMarkingPaid(true);
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/mark-paid`);
      setInvoice((prev) => prev ? { ...prev, ...res.data.data } : prev);
      addToast("Invoice marked as paid.", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) addToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  async function handleCancel() {
    if (!invoiceId || !confirm("Cancel this invoice? This cannot be undone.")) return;
    setIsCancelling(true);
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/cancel`);
      setInvoice((prev) => prev ? { ...prev, ...res.data.data } : prev);
      addToast("Invoice cancelled.", "info");
    } catch (err) {
      if (axios.isAxiosError(err)) addToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) return <div className={styles.loading}><span className={styles.spinner} /></div>;
  if (!invoice) return null;

  const canSend     = invoice.status === "draft" || invoice.status === "overdue";
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "draft";
  const canCancel   = invoice.status !== "paid" && invoice.status !== "cancelled";

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate("/invoices")} type="button">
            ← Invoices
          </button>
          <div>
            <div className={styles.invoiceNumber}>{invoice.invoice_number}</div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>

        <div className={styles.headerActions}>
          {invoice.pdf_url && (
            <a href={invoice.pdf_url} target="_blank" rel="noreferrer" className={styles.secondaryBtn}>
              Download PDF
            </a>
          )}
          {canMarkPaid && (
            <button className={styles.secondaryBtn} onClick={handleMarkPaid} disabled={isMarkingPaid} type="button">
              {isMarkingPaid ? "..." : "Mark as Paid"}
            </button>
          )}
          {canCancel && (
            <button className={styles.dangerBtn} onClick={handleCancel} disabled={isCancelling} type="button">
              {isCancelling ? "..." : "Cancel"}
            </button>
          )}
          {canSend && (
            <button className={styles.primaryBtn} onClick={handleSend} disabled={isSending} type="button">
              {isSending ? "Sending..." : "Send Invoice"}
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.metaGrid}>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Billed To</span>
            <span className={styles.metaValue}>{invoice.client_name}</span>
            <span className={styles.metaSub}>{invoice.client_email}</span>
          </div>
          {invoice.project?.name && (
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Project</span>
              <span className={styles.metaValue}>{invoice.project.name}</span>
            </div>
          )}
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Due Date</span>
            <span className={styles.metaValue}>
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—"}
            </span>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Currency</span>
            <span className={styles.metaValue}>{invoice.currency}</span>
          </div>
          {invoice.paid_at && (
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Paid On</span>
              <span className={styles.metaValue}>
                {new Date(invoice.paid_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th className={styles.numCol}>Qty</th>
              <th className={styles.numCol}>Unit Price</th>
              <th className={styles.numCol}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.line_items ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className={styles.numCol}>{item.quantity}</td>
                <td className={styles.numCol}>{invoice.currency} {Number(item.unit_price).toFixed(2)}</td>
                <td className={styles.numCol}>{invoice.currency} {Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{invoice.currency} {Number(invoice.subtotal).toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax ({invoice.tax_rate}%)</span>
            <span>{invoice.currency} {Number(invoice.tax_amount).toFixed(2)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalFinal}`}>
            <span>Total</span>
            <span>{invoice.currency} {Number(invoice.total).toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className={styles.notes}>
            <span className={styles.metaLabel}>Notes</span>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}