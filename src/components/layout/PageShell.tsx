import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./PageShell.module.css";

interface PageShellProps {
  children: ReactNode;
}

// PageShell owns the sidebar open/close state
// It's the single layout wrapper for every protected route
// Usage: wrap page components in App.tsx OR inside each page — we do it in App.tsx

export function PageShell({ children }: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Page content — scrollable area below the topbar */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
