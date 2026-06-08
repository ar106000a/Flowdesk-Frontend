import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../hooks/UseToast";
import api from "../../lib/api";
import { AuthLayout } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { BaseAuthForm } from "./BaseAuthForm";

export default function ForgotForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Invalid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post("/api/auth/password/otp", { email });
      addToast("Reset OTP sent to your email.", "info");
      navigate(`/auth/reset-verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(err.response?.data?.message || "Could not send OTP. Try again.");
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
        title="Password Reset"
        subtitle="Enter your email and we'll send you a one-time reset code."
        onSubmit={handleSubmit}
        submitLabel="Send OTP"
        isLoading={isLoading}
        errorMessage={apiError}
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
      </BaseAuthForm>
    </AuthLayout>
  );
}