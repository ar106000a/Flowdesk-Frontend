import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/UseAuth";
import { useToast } from "../../hooks/UseToast";
import { authApi as api } from "../../lib/api";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";
import type { User } from "../../types";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Invalid email";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUnverifiedUser(userId: string) {
    try {
      await api.post("/api/auth/register", { email, resend: true });
      addToast("Verification OTP sent to your email.", "info");
    } catch {
      addToast("Please verify your email to continue.", "warning");
    }
    navigate(
      `/auth/verify?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`,
    );
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { user, accessToken } = res.data as {
        user: { id: string; email: string; username: string };
        accessToken: string | null;
        success: boolean;
      };

      if (!accessToken) {
        // Account exists but email not verified yet
        // accessToken is null — we have no session, cannot proceed to dashboard
        await handleUnverifiedUser(user.id);
        return;
      }

      // Fully verified — log in normally
      login(user as unknown as User, accessToken);
      addToast(`Welcome back, ${user.username}!`, "success");
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(err.response?.data?.message || "Invalid credentials.");
      } else {
        setApiError("Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseAuthForm
      title="System Access"
      subtitle="Enter your credentials to authenticate."
      onSubmit={handleSubmit}
      submitLabel="Authenticate"
      isLoading={isLoading}
      errorMessage={apiError}
      footer={
        <p className={styles.footer}>
          Forgot password?{" "}
          <button
            type="button"
            className={styles.link}
            onClick={() => navigate("/auth/forgot")}
          >
            Reset it
          </button>
        </p>
      }
    >
      <AuthField
        label="Email"
        type="email"
        placeholder="operator@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoFocus
        required
        autoComplete="email"
      />
      <AuthField
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="current-password"
      />
    </BaseAuthForm>
  );
}
