import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

const FEATURES = [
  {
    icon: "◈",
    title: "Kanban Board",
    desc: "Drag-and-drop task management with real-time sync across your team.",
  },
  {
    icon: "◎",
    title: "Invoice Builder",
    desc: "Create professional invoices, generate PDFs, and email clients in one click.",
  },
  {
    icon: "⊙",
    title: "Time Tracking",
    desc: "Log billable hours per task. Know exactly what to charge.",
  },
  {
    icon: "◇",
    title: "Client Portal",
    desc: "Share a read-only project link with clients. No login required.",
  },
  {
    icon: "⬡",
    title: "Dashboard",
    desc: "Revenue charts, project stats, and outstanding invoices at a glance.",
  },
  {
    icon: "⌘",
    title: "Real-time",
    desc: "Socket-powered live updates. Every change syncs instantly across all sessions.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>FD</div>
            <span className={styles.brandText}>FLOWDESK</span>
          </div>
          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.navLogin}
              onClick={() => navigate("/auth")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={styles.navCta}
              onClick={() => navigate("/auth")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            NOW IN BETA
          </div>

          <h1 className={styles.heroTitle}>
            Project management
            <br />
            <span className={styles.heroTitleAccent}>for freelancers</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Kanban boards. Time tracking. Professional invoices with PDF export.
            Client portals. Everything a solo operator needs — nothing they
            don't.
          </p>

          <div className={styles.heroCtas}>
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => navigate("/auth")}
            >
              Initialize Account
            </button>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={() => navigate("/auth")}
            >
              Sign In →
            </button>
          </div>

          {/* Fake terminal readout */}
          <div className={styles.terminal}>
            <div className={styles.terminalHeader}>
              <span
                className={styles.terminalDot}
                style={{ background: "#ff5f57" }}
              />
              <span
                className={styles.terminalDot}
                style={{ background: "#febc2e" }}
              />
              <span
                className={styles.terminalDot}
                style={{ background: "#28c840" }}
              />
              <span className={styles.terminalTitle}>
                flowdesk — operator terminal
              </span>
            </div>
            <div className={styles.terminalBody}>
              <p>
                <span className={styles.terminalPrompt}>$</span> status --all
              </p>
              <p>
                <span className={styles.terminalGreen}>✓</span> Projects:{" "}
                <span className={styles.terminalGreen}>ACTIVE</span>
              </p>
              <p>
                <span className={styles.terminalGreen}>✓</span> Invoices:{" "}
                <span className={styles.terminalGreen}>
                  3 SENT · $8,400 OUTSTANDING
                </span>
              </p>
              <p>
                <span className={styles.terminalGreen}>✓</span> Time logged this
                month: <span className={styles.terminalGreen}>47.5h</span>
              </p>
              <p>
                <span className={styles.terminalGreen}>✓</span> Client portals:{" "}
                <span className={styles.terminalGreen}>2 ACTIVE</span>
              </p>
              <p>
                <span className={styles.terminalPrompt}>$</span>{" "}
                <span className={styles.terminalCursor}>█</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>// Feature Set</p>
          <h2 className={styles.sectionTitle}>
            Everything in one control panel
          </h2>

          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>// Workflow</p>
          <h2 className={styles.sectionTitle}>From project to payment</h2>

          <div className={styles.steps}>
            {[
              {
                n: "01",
                title: "Create a project",
                desc: "Set up a project for your client with a color, budget, and description.",
              },
              {
                n: "02",
                title: "Track tasks + time",
                desc: "Move tasks across your Kanban board and log billable hours per task.",
              },
              {
                n: "03",
                title: "Send an invoice",
                desc: "Build an invoice from your time logs, generate a PDF, and email it to your client.",
              },
              {
                n: "04",
                title: "Share the portal",
                desc: "Give your client a read-only link to view progress and invoices — no account needed.",
              },
            ].map((step) => (
              <div key={step.n} className={styles.step}>
                <div className={styles.stepNumber}>{step.n}</div>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaCardCorner} data-pos="tl" />
            <div className={styles.ctaCardCorner} data-pos="tr" />
            <div className={styles.ctaCardCorner} data-pos="bl" />
            <div className={styles.ctaCardCorner} data-pos="br" />

            <p className={styles.sectionLabel}>// Get Started</p>
            <h2 className={styles.ctaTitle}>
              Ready to run your freelance operation like a pro?
            </h2>
            <p className={styles.ctaSubtitle}>
              Free to use. No credit card required.
            </p>
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => navigate("/auth")}
            >
              Initialize Account
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>FD</div>
            <span className={styles.brandText}>FLOWDESK</span>
          </div>
          <p className={styles.footerText}>
            Project management for the solo operator.
          </p>
          <div className={styles.footerLinks}>
            <button
              type="button"
              className={styles.footerLink}
              onClick={() => navigate("/auth")}
            >
              Sign In
            </button>
            <span className={styles.footerDivider}>//</span>
            <button
              type="button"
              className={styles.footerLink}
              onClick={() => navigate("/auth")}
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
