import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/UseAuth";
import { useToast } from "../../hooks/UseToast";
import { authApi as api } from "../../lib/api";
import { AuthLayout } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";
import type { User } from "../../types";
import styles from "./LoginForm.module.css";

export default function VerifyForm() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillEmail = searchParams.get("email") || "";
  const userId = searchParams.get("userId") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");

    if (!otp.trim()) {
      setApiError("Enter the OTP from your verification email.");
      return;
    }

    if (!userId) {
      setApiError("Session expired. Please register again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/confirm_email", {
        id: userId,
        otp: otp.trim(),
      });
      const user = res.data.user as User;
      const accessToken = res.data.accessToken as string | undefined;
      login(user, accessToken);
      addToast("Email verified. Welcome aboard!", "success");
      navigate("/dashboard");
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

  async function handleResend() {
    if (!prefillEmail) {
      addToast("No email found. Please register again.", "error");
      return;
    }
    setResending(true);
    try {
      await api.post("/api/auth/register", {
        email: prefillEmail,
        resend: true,
      });
      addToast("New verification email sent.", "info");
    } catch {
      addToast("Could not resend. Try again later.", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout showBackToLogin>
      <BaseAuthForm
        title="Email Verification"
        subtitle={`An OTP was sent to ${prefillEmail || "your email"}. Enter it below.`}
        onSubmit={handleSubmit}
        submitLabel="Verify OTP"
        isLoading={isLoading}
        errorMessage={apiError}
        footer={
          <p>
            Didn't receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className={styles.link}
              style={{ opacity: resending ? 0.5 : 1 }}
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>
        }
      >
        <AuthField
          label="Verification OTP"
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
