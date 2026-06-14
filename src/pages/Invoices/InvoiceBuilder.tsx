import { useState } from "react";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { Modal } from "../../components/ui/Modal";
import { InvoiceLineItem } from "./InvoiceLineItem";
import type { LineItemDraft } from "./InvoiceLineItem";
import type { Invoice, Project } from "../../types";
import styles from "./InvoiceBuilder.module.css";

const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR"];

function newLineItem(): LineItemDraft {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unit_price: "",
  };
}

interface InvoiceBuilderProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onCreated: (invoice: Invoice) => void;
}

export function InvoiceBuilder({
  open,
  onClose,
  project,
  onCreated,
}: InvoiceBuilderProps) {
  const { addToast } = useToast();

  const [clientName, setClientName] = useState(project.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(project.client_email ?? "");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItemDraft[]>([newLineItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateItem(
    id: string,
    field: keyof Omit<LineItemDraft, "id">,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, newLineItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const subtotal = items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.unit_price) || 0;
    return sum + q * p;
  }, 0);

  const taxRateNum = parseFloat(taxRate) || 0;
  const taxAmount = subtotal * (taxRateNum / 100);
  const total = subtotal + taxAmount;

  function validate() {
    const next: Record<string, string> = {};
    if (!clientName.trim()) next.clientName = "Client name is required";
    if (!clientEmail.trim()) next.clientEmail = "Client email is required";
    else if (!/\S+@\S+\.\S+/.test(clientEmail))
      next.clientEmail = "Invalid email";

    const validItems = items.filter((i) => i.description.trim());
    if (validItems.length === 0) next.items = "Add at least one line item";

    for (const item of items) {
      if (!item.description.trim()) continue;
      const q = parseFloat(item.quantity);
      if (!q || q <= 0) {
        next.items = "All line items need a valid quantity";
        break;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        currency,
        due_date: dueDate || undefined,
        tax_rate: taxRateNum,
        notes: notes.trim() || undefined,
        line_items: items
          .filter((i) => i.description.trim())
          .map((i) => ({
            description: i.description.trim(),
            quantity: parseFloat(i.quantity) || 1,
            unit_price: parseFloat(i.unit_price) || 0,
          })),
      };

      const res = await api.post(
        `/api/projects/${project.id}/invoices`,
        payload,
      );
      onCreated(res.data.data as Invoice);
      addToast(`Invoice ${res.data.data.invoice_number} created.`, "success");
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addToast(
          err.response?.data?.message || "Failed to create invoice",
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setClientName(project.client_name ?? "");
    setClientEmail(project.client_email ?? "");
    setCurrency("USD");
    setDueDate("");
    setTaxRate("0");
    setNotes("");
    setItems([newLineItem()]);
    setErrors({});
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Invoice"
      size="lg"
      preventClose={isSubmitting}
    >
      <div className={styles.form}>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>
              Client Name <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.clientName ? styles.inputError : ""}`}
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client or company name"
            />
            {errors.clientName && (
              <p className={styles.error}>{errors.clientName}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Client Email <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.clientEmail ? styles.inputError : ""}`}
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@domain.com"
            />
            {errors.clientEmail && (
              <p className={styles.error}>{errors.clientEmail}</p>
            )}
          </div>
        </div>

        <div className={styles.row3}>
          <div className={styles.field}>
            <label className={styles.label}>Currency</label>
            <select
              className={styles.select}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Due Date</label>
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tax Rate (%)</label>
            <input
              type="number"
              className={styles.input}
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.itemsSection}>
          <div className={styles.itemsHeader}>
            <span className={styles.sectionLabel}>// Line Items</span>
            <button
              type="button"
              className={styles.addItemBtn}
              onClick={addItem}
            >
              + Add Line
            </button>
          </div>

          <div className={styles.itemsColHeaders}>
            <span>Description</span>
            <span style={{ textAlign: "center" }}>Qty</span>
            <span>Unit Price</span>
            <span style={{ textAlign: "right" }}>Amount</span>
            <span></span>
          </div>

          <div className={styles.itemsList}>
            {items.map((item) => (
              <InvoiceLineItem
                key={item.id}
                item={item}
                onChange={updateItem}
                onRemove={removeItem}
                canRemove={items.length > 1}
                currency={currency}
              />
            ))}
          </div>

          {errors.items && <p className={styles.error}>{errors.items}</p>}
        </div>

        <div className={styles.totalsBox}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>
              {currency}{" "}
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax ({taxRateNum}%)</span>
            <span>
              {currency}{" "}
              {taxAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
            <span>Total</span>
            <span>
              {currency}{" "}
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Notes (optional)</label>
          <textarea
            className={styles.textarea}
            placeholder="Payment terms, thank you note, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.spinner} />
            ) : (
              "Create Invoice"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
