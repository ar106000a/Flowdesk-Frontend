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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (invoiceId) {
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
      fetchInvoice();
    }
  }, [invoiceId, addToast, navigate]);

  async function handleGeneratePdf() {
    if (!invoiceId) return;
    setIsGeneratingPdf(true);
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/pdf`);
      setInvoice((prev) =>
        prev ? { ...prev, pdf_url: res.data.data.pdf_url } : prev,
      );
      addToast("PDF generated.", "success");
    } catch {
      addToast("Failed to generate PDF.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (isLoading)
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
      </div>
    );
  if (!invoice) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/invoices")}
            type="button"
          >
            ← Invoices
          </button>
          <div>
            <div className={styles.invoiceNumber}>{invoice.invoice_number}</div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
        <div className={styles.headerActions}>
          {invoice.pdf_url ? (
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noreferrer"
              className={styles.pdfBtn}
            >
              Download PDF
            </a>
          ) : (
            <button
              className={styles.pdfBtn}
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              type="button"
            >
              {isGeneratingPdf ? "Generating..." : "Generate PDF"}
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.metaGrid}>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Billed To</span>
            <span className={styles.metaValue}>{invoice.client_name}</span>
            <span className={styles.metaSub}>{invoice.client_email}</span>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Due Date</span>
            <span className={styles.metaValue}>
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Currency</span>
            <span className={styles.metaValue}>{invoice.currency}</span>
          </div>
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
                <td className={styles.numCol}>
                  {invoice.currency} {Number(item.unit_price).toFixed(2)}
                </td>
                <td className={styles.numCol}>
                  {invoice.currency} {Number(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>
              {invoice.currency} {Number(invoice.subtotal).toFixed(2)}
            </span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax ({invoice.tax_rate}%)</span>
            <span>
              {invoice.currency} {Number(invoice.tax_amount).toFixed(2)}
            </span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalFinal}`}>
            <span>Total</span>
            <span>
              {invoice.currency} {Number(invoice.total).toFixed(2)}
            </span>
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
