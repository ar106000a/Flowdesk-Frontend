import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../hooks/UseToast";
import { authApi as api } from "../../lib/api";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";
import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Username availability state ─────────────────────────────────────────
  type AvailabilityStatus =
    | "idle"
    | "checking"
    | "available"
    | "taken"
    | "error";
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check availability whenever username or email changes
  // We send email too so the API can allow re-registration of unverified accounts
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Don't check if username is too short or has spaces
    if (username.trim().length < 3 || /\s/.test(username)) {
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setAvailability("checking");
      try {
        const res = await api.post("/api/auth/username", {
          username: username.trim(),
          email: email.trim(),
        });
        setAvailability(res.data.isAvailable ? "available" : "taken");
      } catch {
        setAvailability("error");
      }
    }, 2000); // 500ms debounce

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [username, email]);

  function validate() {
    const next: Record<string, string> = {};
    if (!username.trim()) next.username = "Username is required";
    else if (username.trim().length < 3) next.username = "Min 3 characters";
    else if (/\s/.test(username)) next.username = "No spaces allowed";
    else if (availability === "taken")
      next.username = "Username is already taken";
    else if (availability === "checking")
      next.username = "Wait for availability check";
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Invalid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Min 8 characters";
    if (password !== confirmPassword)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        username: username.trim(),
        email,
        password,
      });
      const userId = res.data.userId || res.data.user?.id || "";
      addToast("Verification email sent. Check your inbox.", "info");
        addToast("Verification email sent. Check your inbox.", "info");
      navigate(
        `/auth/verify?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message || "Registration failed. Try again.",
        );
      } else {
        setApiError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseAuthForm
      title="New Operator"
      subtitle="Create your account to get started."
      onSubmit={handleSubmit}
      submitLabel="Initialize Account"
      isLoading={isLoading}
      errorMessage={apiError}
    >
      {/* Username field with inline availability indicator */}
      <div className={styles.usernameWrap}>
        <AuthField
          label="Username"
          type="text"
          placeholder="your_handle"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          autoFocus
          required
          autoComplete="username"
        />
        {/* Availability indicator — only shows when username is long enough */}
        {username.trim().length >= 3 && !errors.username && (
          <div className={`${styles.indicator} ${styles[availability]}`}>
            {availability === "checking" && (
              <>
                <span className={styles.spinner} /> Checking...
              </>
            )}
            {availability === "available" && (
              <>
                <span className={styles.dot} />
                Available
              </>
            )}
            {availability === "taken" && (
              <>
                <span className={styles.dot} />
                Taken
              </>
            )}
            {availability === "error" && (
              <>
                <span className={styles.dot} />
                Could not verify
              </>
            )}
          </div>
        )}
      </div>

      <AuthField
        label="Email"
        type="email"
        placeholder="operator@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
      />
      <AuthField
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
      />
      <AuthField
        label="Confirm Password"
        type="password"
        placeholder="Same password again"
        value={confirmPassword}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
      />
    </BaseAuthForm>
  );
}
