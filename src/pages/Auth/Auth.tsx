import { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm.tsx";
import { RegisterForm } from "./RegisterForm.tsx";
import styles from "./Auth.module.css";

type Tab = "signin" | "signup";

export default function Auth() {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <AuthLayout>
      {/* Rocker switch tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "signin" ? styles.tabActive : ""}`}
          onClick={() => setTab("signin")}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "signup" ? styles.tabActive : ""}`}
          onClick={() => setTab("signup")}
        >
          Register
        </button>
      </div>

      {/* Swap form based on active tab */}
      {tab === "signin" ? <LoginForm /> : <RegisterForm />}
    </AuthLayout>
  );
}
