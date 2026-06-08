import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./Modal.module.css";

// ─── Why Radix Dialog? ────────────────────────────────────────────────────────
// Building an accessible modal from scratch is deceptively hard:
// focus trapping, scroll lock, aria attributes, Escape key, click outside
// Radix handles all of that. We just supply our own styles.

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  // Prevent closing by clicking the backdrop (e.g. during form submission)
  preventClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  preventClose = false,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !preventClose) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={`${styles.content} ${styles[size]}`}
          // Prevent closing on outside click when preventClose is true
          onInteractOutside={(e) => {
            if (preventClose) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (preventClose) e.preventDefault();
          }}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            {!preventClose && (
              <Dialog.Close className={styles.closeBtn} aria-label="Close">
                ✕
              </Dialog.Close>
            )}
          </div>

          {description && (
            <Dialog.Description className={styles.description}>
              {description}
            </Dialog.Description>
          )}

          <div className={styles.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
