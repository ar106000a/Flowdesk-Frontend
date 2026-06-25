import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import styles from "./PageShell.module.css";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavClick={() => setSidebarOpen(false)}
        />
      </div>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen((prev) => !prev)}
            type="button"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        </div>
        <div className={styles.content}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
