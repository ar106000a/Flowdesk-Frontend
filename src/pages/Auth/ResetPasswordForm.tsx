import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../hooks/UseToast";
import api from "../../lib/api";
import { AuthLayout } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";

export default function ResetPasswordForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Min 8 characters";
    if (password !== confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post("/api/auth/password/reset", {
        email,
        otp,
        newPassword: password,
      });
      addToast("Password reset. You can now sign in.", "success");
      navigate("/auth");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message || "Reset failed. Please start over.",
        );
      } else {
        setApiError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout showBackToLogin>
      <BaseAuthForm
        title="New Password"
        subtitle="Choose a strong new password for your account."
        onSubmit={handleSubmit}
        submitLabel="Set New Password"
        isLoading={isLoading}
        errorMessage={apiError}
      >
        <AuthField
          label="New Password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoFocus
          required
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm Password"
          type="password"
          placeholder="Same password again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          required
          autoComplete="new-password"
        />
      </BaseAuthForm>
    </AuthLayout>
  );
}
