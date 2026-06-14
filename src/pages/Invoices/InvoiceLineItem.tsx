import styles from "./InvoiceLineItem.module.css";

export interface LineItemDraft {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
}

interface InvoiceLineItemProps {
  item: LineItemDraft;
  onChange: (
    id: string,
    field: keyof Omit<LineItemDraft, "id">,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  currency: string;
}

export function InvoiceLineItem({
  item,
  onChange,
  onRemove,
  canRemove,
  currency,
}: InvoiceLineItemProps) {
  const quantity = parseFloat(item.quantity) || 0;
  const unitPrice = parseFloat(item.unit_price) || 0;
  const amount = quantity * unitPrice;

  return (
    <div className={styles.row}>
      <input
        type="text"
        className={styles.descInput}
        placeholder="Service or item description"
        value={item.description}
        onChange={(e) => onChange(item.id, "description", e.target.value)}
      />

      <input
        type="number"
        className={styles.qtyInput}
        placeholder="1"
        min="0"
        step="0.5"
        value={item.quantity}
        onChange={(e) => onChange(item.id, "quantity", e.target.value)}
      />

      <div className={styles.priceWrap}>
        <span className={styles.currencyPrefix}>{currency}</span>
        <input
          type="number"
          className={styles.priceInput}
          placeholder="0.00"
          min="0"
          step="0.01"
          value={item.unit_price}
          onChange={(e) => onChange(item.id, "unit_price", e.target.value)}
        />
      </div>

      <div className={styles.amountWrap}>
        <span className={styles.amount}>
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(item.id)}
        disabled={!canRemove}
        aria-label="Remove line item"
      >
        ✕
      </button>
    </div>
  );
}
