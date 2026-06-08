import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useToast } from "../../hooks/UseToast";
import styles from "./Sidebar.module.css";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "▣" },
  { path: "/projects", label: "Projects", icon: "◈" },
  { path: "/invoices", label: "Invoices", icon: "◎" },
  { path: "/settings", label: "Settings", icon: "⚙" },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    addToast("Session terminated.", "info");
    navigate("/auth");
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* ── Logo panel ──────────────────────────────────── */}
        <div className={styles.logoPanel}>
          <div className={styles.logoMark}>FD</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>Flowdesk</span>
            <span className={styles.logoSub}>Control Panel</span>
          </div>
          {/* LED power indicator */}
          <div className={styles.powerLed} aria-label="System online" />
        </div>

        {/* ── Operator info ────────────────────────────────── */}
        <div className={styles.operatorPanel}>
          <div className={styles.operatorAvatar}>
            {user?.full_name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className={styles.operatorInfo}>
            <span className={styles.operatorName}>
              {user?.full_name ?? "Operator"}
            </span>
            <span className={styles.operatorEmail}>{user?.email ?? ""}</span>
          </div>
        </div>

        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className={styles.nav} aria-label="Main navigation">
          <p className={styles.navLabel}>Navigation</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
              onClick={onClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navItemLabel}>{item.label}</span>
              {/* Active indicator LED */}
              <span className={styles.activeIndicator} />
            </NavLink>
          ))}
        </nav>

        {/* ── Spacer ──────────────────────────────────────── */}
        <div className={styles.spacer} />

        {/* ── System status ────────────────────────────────── */}
        <div className={styles.statusPanel}>
          <p className={styles.navLabel}>System</p>
          <div className={styles.statusRow}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>All systems nominal</span>
          </div>
        </div>

        {/* ── Logout ──────────────────────────────────────── */}
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          type="button"
        >
          <span>⏻</span>
          <span>Terminate Session</span>
        </button>
      </aside>
    </>
  );
}
