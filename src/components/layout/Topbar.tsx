import { useLocation } from "react-router-dom";
import styles from "./Topbar.module.css";

// Derive a page title from the current route
function usePageTitle(): string {
  const { pathname } = useLocation();
  if (pathname.startsWith("/projects/")) return "Project Detail";
  if (pathname.startsWith("/invoices/")) return "Invoice Detail";
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/invoices": "Invoices",
    "/settings": "Settings",
  };
  return map[pathname] ?? "Flowdesk";
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const title = usePageTitle();

  return (
    <header className={styles.topbar}>
      {/* Mobile menu trigger */}
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        type="button"
        aria-label="Open navigation"
      >
        <span className={styles.menuIcon}>
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Page title — engraved label style */}
      <div className={styles.titleWrap}>
        <span className={styles.titleSlash}>//</span>
        <h1 className={styles.title}>{title}</h1>
      </div>

      {/* Right side — status readouts */}
      <div className={styles.rightPanel}>
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>Status</span>
          <span className={styles.readoutValue}>Online</span>
        </div>
        <div className={styles.separator} />
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>Build</span>
          <span className={styles.readoutValue}>v1.0</span>
        </div>
      </div>
    </header>
  );
}
