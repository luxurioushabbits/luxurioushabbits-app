import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err) => setError(err.message || "Reset failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    resetMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "oklch(0.9 0 0)", marginBottom: "1rem" }}>Invalid Reset Link</h2>
          <p style={{ color: "oklch(0.6 0 0)", marginBottom: "1.5rem" }}>This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password">
            <span style={{ color: "oklch(0.6 0.1 300)", cursor: "pointer" }}>Request a new reset link</span>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{
            background: "oklch(0.08 0 0)",
            border: "1px solid oklch(0.15 0 0)",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
            <h2 style={{ color: "oklch(0.9 0 0)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>Password Reset!</h2>
            <p style={{ color: "oklch(0.6 0 0)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <button style={{
                marginTop: "1.5rem",
                padding: "0.75rem 2rem",
                background: "oklch(0.96 0 0)",
                color: "oklch(0.04 0 0)",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}>
                SIGN IN
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/">
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2rem",
              letterSpacing: "0.1em",
              color: "oklch(0.96 0 0)",
              cursor: "pointer",
            }}>
              LUXURIOUS HABBITS
            </h1>
          </Link>
          <p style={{ color: "oklch(0.5 0 0)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Set your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "oklch(0.08 0 0)",
          border: "1px solid oklch(0.15 0 0)",
          borderRadius: "8px",
          padding: "2rem",
        }}>
          {error && (
            <div style={{
              background: "oklch(0.15 0.05 25)",
              border: "1px solid oklch(0.3 0.1 25)",
              borderRadius: "4px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              color: "oklch(0.7 0.1 25)",
              fontSize: "0.85rem",
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "oklch(0.7 0 0)", fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "oklch(0.06 0 0)",
                border: "1px solid oklch(0.2 0 0)",
                borderRadius: "4px",
                color: "oklch(0.9 0 0)",
                fontSize: "0.95rem",
                outline: "none",
              }}
              placeholder="Min 8 characters"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "oklch(0.7 0 0)", fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "oklch(0.06 0 0)",
                border: "1px solid oklch(0.2 0 0)",
                borderRadius: "4px",
                color: "oklch(0.9 0 0)",
                fontSize: "0.95rem",
                outline: "none",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: "oklch(0.96 0 0)",
              color: "oklch(0.04 0 0)",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: resetMutation.isPending ? "not-allowed" : "pointer",
              opacity: resetMutation.isPending ? 0.7 : 1,
            }}
          >
            {resetMutation.isPending ? "Resetting..." : "RESET PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}
