import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import axios from "axios";
import api from "../../lib/api";
import { useToast } from "../../hooks/UseToast";
import { InvoiceStatusBadge } from "../Invoices/InvoiceStatusBadge";
import type { InvoiceStatus } from "../../types";
import styles from "./Dashboard.module.css";

interface DashboardData {
  total_revenue: number;
  pending_revenue: number;
  active_projects: number;
  total_hours_this_month: number;
  revenue_by_month: { month: string; amount: number }[];
  project_stats: {
    project_id: string;
    project_name: string;
    project_color: string;
    project_status: string;
    total_tasks: number;
    completed_tasks: number;
    total_hours: number;
    billed_amount: number;
  }[];
  recent_invoices: {
    id: string;
    invoice_number: string;
    client_name: string;
    total: number;
    currency: string;
    status: InvoiceStatus;
    created_at: string;
  }[];
}

// Custom tooltip for the bar chart
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>
        $
        {Number(payload[0].value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/api/dashboard");
        setData(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err))
          addToast("Failed to load dashboard", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [addToast]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        <p>Loading systems...</p>
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(...data.revenue_by_month.map((m) => m.amount), 1);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>// Dashboard</h2>
        <p className={styles.pageSubtitle}>All systems nominal</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            $
            {data.total_revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending</span>
          <span className={`${styles.statValue} ${styles.statPending}`}>
            $
            {data.pending_revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Projects</span>
          <span className={styles.statValue}>{data.active_projects}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Hours This Month</span>
          <span className={styles.statValue}>
            {data.total_hours_this_month}h
          </span>
        </div>
      </div>

      {/* ── Revenue chart ────────────────────────────────────── */}
      <div className={styles.card}>
        <p className={styles.cardLabel}>// Revenue (Last 6 Months)</p>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenue_by_month} barSize={28}>
              <XAxis
                dataKey="month"
                tick={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  fill: "#666",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  fill: "#666",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {data.revenue_by_month.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.amount === maxRevenue && entry.amount > 0
                        ? "var(--hw-accent-lcd)"
                        : "#2a2a2a"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* ── Project stats ──────────────────────────────────── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>// Projects</p>
          {data.project_stats.length === 0 ? (
            <p className={styles.empty}>No projects yet.</p>
          ) : (
            <div className={styles.projectList}>
              {data.project_stats.map((proj) => {
                const completionPct =
                  proj.total_tasks > 0
                    ? Math.round(
                        (proj.completed_tasks / proj.total_tasks) * 100,
                      )
                    : 0;
                return (
                  <button
                    key={proj.project_id}
                    className={styles.projectRow}
                    onClick={() => navigate(`/projects/${proj.project_id}`)}
                    type="button"
                  >
                    <div className={styles.projectRowLeft}>
                      <div
                        className={styles.projectDot}
                        style={{
                          background: proj.project_color,
                          boxShadow: `0 0 6px ${proj.project_color}`,
                        }}
                      />
                      <div>
                        <p className={styles.projectName}>
                          {proj.project_name}
                        </p>
                        <p className={styles.projectMeta}>
                          {proj.completed_tasks}/{proj.total_tasks} tasks ·{" "}
                          {proj.total_hours}h
                        </p>
                      </div>
                    </div>
                    <div className={styles.projectRowRight}>
                      <span className={styles.projectBilled}>
                        $
                        {proj.billed_amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent invoices ─────────────────────────────────── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>// Recent Invoices</p>
          {data.recent_invoices.length === 0 ? (
            <p className={styles.empty}>No invoices yet.</p>
          ) : (
            <div className={styles.invoiceList}>
              {data.recent_invoices.map((inv) => (
                <button
                  key={inv.id}
                  className={styles.invoiceRow}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  type="button"
                >
                  <div>
                    <p className={styles.invoiceNumber}>{inv.invoice_number}</p>
                    <p className={styles.invoiceClient}>{inv.client_name}</p>
                  </div>
                  <div className={styles.invoiceRowRight}>
                    <span className={styles.invoiceAmount}>
                      {inv.currency}{" "}
                      {inv.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
