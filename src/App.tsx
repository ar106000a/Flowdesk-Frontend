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
import Landing from "./pages/Landing/Landing";
import Auth from "./pages/Auth/Auth";
import VerifyForm from "./pages/Auth/VerifyForm";
import ForgotForm from "./pages/Auth/ForgotForm";
import ResetVerifyForm from "./pages/Auth/ResetVerifyForm";
import ResetPasswordForm from "./pages/Auth/ResetPasswordForm";
import Dashboard from "./pages/Dashboard/Dashboard";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import Invoices from "./pages/Invoices/Invoices";
import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
import ClientPortal from "./pages/Portal/ClientPortal";
import Settings from "./pages/Settings/Settings";

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

// Redirects / based on auth state
function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <SocketProvider isAuthenticated={isAuthenticated}>
      <Routes>
        {/* Landing / Home */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Auth flows — redirect to dashboard if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/verify" element={<VerifyForm />} />
          <Route path="/auth/forgot" element={<ForgotForm />} />
          <Route path="/auth/reset-verify" element={<ResetVerifyForm />} />
          <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        </Route>

        {/* Fully public */}
        <Route path="/portal/:token" element={<ClientPortal />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <PageShell>
                <Dashboard />
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
                <Invoices />
              </PageShell>
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <PageShell>
                <InvoiceDetail />
              </PageShell>
            }
          />
          <Route
            path="/settings"
            element={
              <PageShell>
                <Settings />
              </PageShell>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
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
