import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../hooks/UseToast";
import api from "../../lib/api";
import { AuthLayout } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";

export default function ResetVerifyForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp]             = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState("");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");
    if (!otp.trim()) { setApiError("Enter the OTP from your email."); return; }

    setIsLoading(true);
    try {
      await api.post("/api/auth/password/verify", { email, otp });
      addToast("OTP verified. Set your new password.", "success");
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(err.response?.data?.message || "Invalid or expired OTP.");
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
        title="Enter OTP"
        subtitle={`We sent a one-time code to ${email || "your email"}. Enter it below.`}
        onSubmit={handleSubmit}
        submitLabel="Verify OTP"
        isLoading={isLoading}
        errorMessage={apiError}
      >
        <AuthField
          label="One-Time Code"
          type="text"
          placeholder="Enter OTP"
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