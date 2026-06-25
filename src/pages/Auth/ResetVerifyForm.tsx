import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../hooks/UseToast";
import { authApi as api } from "../../lib/api";
import { AuthLayout } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";

export default function ResetVerifyForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // When coming from Settings, we have a pending new password in sessionStorage
  const fromSettings = searchParams.get("from") === "settings";
  const pendingPassword = fromSettings
    ? sessionStorage.getItem("pending_new_password")
    : null;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");

    if (!otp.trim()) {
      setApiError("Enter the OTP from your email.");
      return;
    }

    if (fromSettings && pendingPassword) {
      // Coming from Settings — verify OTP and reset password in one go
      setIsLoading(true);
      try {
        await api.post("/api/auth/password/verify", { otp: otp.trim() });
        await api.post("/api/auth/password/reset", {
          password: pendingPassword,
        });
        sessionStorage.removeItem("pending_new_password");
        addToast("Password changed successfully.", "success");
        navigate("/dashboard");
      } catch (err: unknown) {
        if (axios.isAxiosError(err))
          setApiError(err.response?.data?.message || "Invalid or expired OTP.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Coming from forgot password flow — just verify OTP, then go to reset page
      setIsLoading(true);
      try {
        await api.post("/api/auth/password/verify", { otp: otp.trim() });
        sessionStorage.setItem("otp_verified", otp.trim());
        navigate("/auth/reset-password");
      } catch (err: unknown) {
        if (axios.isAxiosError(err))
          setApiError(err.response?.data?.message || "Invalid or expired OTP.");
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <AuthLayout showBackToLogin>
      <BaseAuthForm
        title="Verify OTP"
        subtitle={
          fromSettings
            ? `Enter the OTP sent to your email to confirm your password change.`
            : `Enter the OTP we sent to your email.`
        }
        onSubmit={handleSubmit}
        submitLabel="Verify"
        isLoading={isLoading}
        errorMessage={apiError}
      >
        <AuthField
          label="OTP Code"
          type="text"
          placeholder="Enter OTP from email"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          autoFocus
          required
          autoComplete="one-time-code"
        />
      </BaseAuthForm>
    </AuthLayout>
  );
}
