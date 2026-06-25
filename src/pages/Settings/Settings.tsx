import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/UseAuth";
import { useToast } from "../../hooks/UseToast";
import { authApi } from "../../lib/api";
import styles from "./Settings.module.css";

export default function Settings() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  async function handleSaveProfile(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await authApi.patch("/api/auth/profile", {
        userId: user?.id,
        full_name: fullName.trim(),
      });
      addToast("Profile updated.", "success");
    } catch (err) {
      if (axios.isAxiosError(err))
        addToast(
          err.response?.data?.message || "Failed to update profile",
          "error",
        );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!newPwd) {
      addToast("Enter a new password", "error");
      return;
    }
    if (newPwd.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    if (newPwd !== confirmPwd) {
      addToast("Passwords do not match", "error");
      return;
    }

    setIsChangingPwd(true);
    try {
      // Send OTP to user's email
      await authApi.post("/api/auth/password/otp", { email: user?.email });

      // Temporarily store the new password so reset-verify page can use it
      // sessionStorage is cleared when the tab closes — safe for this use case
      sessionStorage.setItem("pending_new_password", newPwd);

      addToast("OTP sent to your email.", "info");
      navigate("/auth/reset-verify?from=settings");
    } catch (err) {
      if (axios.isAxiosError(err))
        addToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setIsChangingPwd(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>// Settings</h2>
      </div>

      <section className={styles.card}>
        <p className={styles.cardLabel}>// Profile</p>
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              className={`${styles.input} ${styles.inputReadonly}`}
              value={user?.username ?? ""}
              readOnly
            />
            <p className={styles.hint}>
              Username cannot be changed after registration.
            </p>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={`${styles.input} ${styles.inputReadonly}`}
              value={user?.email ?? ""}
              readOnly
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Your full name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <p className={styles.cardLabel}>// Change Password</p>
        <p className={styles.cardHint}>
          An OTP will be sent to {user?.email} to confirm the change.
        </p>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Min 8 characters"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Same password again"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isChangingPwd}
            >
              {isChangingPwd ? "Sending OTP..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <p className={styles.cardLabel}>// Session</p>
        <div className={styles.dangerRow}>
          <div>
            <p className={styles.dangerTitle}>Terminate Session</p>
            <p className={styles.dangerDesc}>
              Log out of Flowdesk on this device.
            </p>
          </div>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleLogout}
          >
            Terminate
          </button>
        </div>
      </section>
    </div>
  );
}
