import {type ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
  // Some flows show a back-to-login link
  showBackToLogin?: boolean;
}

export function AuthLayout({
  children,
  showBackToLogin = false,
}: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      {/* Branding — always above the card */}
      <div className={styles.branding}>
        <div className={styles.logo}>FD</div>
        <h1 className={styles.appName}>Flowdesk</h1>
        <p className={styles.tagline}>Project management for freelancers</p>
      </div>

      {/* Card chassis */}
      <div className={styles.card}>{children}</div>

      {showBackToLogin && (
        <Link to="/auth" className={styles.backLink}>
          ← Back to login
        </Link>
      )}
    </div>
  );
}
