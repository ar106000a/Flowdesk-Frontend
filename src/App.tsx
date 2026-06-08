import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/UseAuth";
import { AuthProvider } from "./context/AuthProvider";
import { SocketProvider } from "./context/SocketProvider";
import { ToastProvider } from "./context/ToastProvider";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/routing/RouteGuards";
import { PageShell } from "./components/layout/PageShell";

// Auth pages
import Auth from "./pages/Auth/Auth";
import VerifyForm from "./pages/Auth/VerifyForm";
import ForgotForm from "./pages/Auth/ForgotForm";
import ResetVerifyForm from "./pages/Auth/ResetVerifyForm";
import ResetPasswordForm from "./pages/Auth/ResetPasswordForm";

// App pages
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--hw-text-stenciled)",
      }}
    >
      <h2
        style={{ textTransform: "uppercase", letterSpacing: 2, fontSize: 13 }}
      >
        // {name}
      </h2>
      <p style={{ color: "var(--hw-text-dim)", marginTop: 8, fontSize: 11 }}>
        Module coming online...
      </p>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <SocketProvider isAuthenticated={isAuthenticated}>
      <Routes>
        {/* ── Public-only ─────────────────────────────────── */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/verify" element={<VerifyForm />} />
          <Route path="/auth/forgot" element={<ForgotForm />} />
          <Route path="/auth/reset-verify" element={<ResetVerifyForm />} />
          {/* <Route
            path="/dashboard"
            element={
              <PageShell>
                <PlaceholderPage name="Dashboard" />
              </PageShell>
            }
          ></Route>
          <Route
            path="/projects"
            element={
              <PageShell>
                <Projects></Projects>
              </PageShell>
            }
          ></Route> */}
          <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        </Route>

        {/* ── Fully public ─────────────────────────────────── */}
        <Route
          path="/portal/:token"
          element={<PlaceholderPage name="Client Portal" />}
        />
        <Route
          path="/payment/success"
          element={<PlaceholderPage name="Payment Success" />}
        />

        {/* ── Protected ────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <PageShell>
                <PlaceholderPage name="Dashboard" />
              </PageShell>
            }
          />
          <Route
            path="/projects"
            element={
              <PageShell>
                <Projects />
              </PageShell>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PageShell>
                <ProjectDetail />
              </PageShell>
            }
          />
          <Route
            path="/invoices"
            element={
              <PageShell>
                <PlaceholderPage name="Invoices" />
              </PageShell>
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <PageShell>
                <PlaceholderPage name="Invoice Detail" />
              </PageShell>
            }
          />
          <Route
            path="/settings"
            element={
              <PageShell>
                <PlaceholderPage name="Settings" />
              </PageShell>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
