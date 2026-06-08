import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps routes that require a logged-in user
// If not authenticated → redirect to /auth
// If still loading (silent refresh in progress) → render nothing (no flash)
//
// Usage in App.tsx:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/dashboard" element={<Dashboard />} />
//     <Route path="/projects" element={<Projects />} />
//   </Route>

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Blank screen while we check for an existing session
  // This prevents the login page from flashing before the silent refresh completes
  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}

// ─── PublicOnlyRoute ──────────────────────────────────────────────────────────
// Wraps routes that should NOT be accessible when logged in
// e.g. the /auth page — if you're already in, go to dashboard
//
// Usage:
//   <Route element={<PublicOnlyRoute />}>
//     <Route path="/auth" element={<Auth />} />
//   </Route>

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
