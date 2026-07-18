import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
    onError: (err) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo / Brand */}
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
            Sign in to your account
          </p>
        </div>

        {/* Form */}
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ color: "oklch(0.7 0 0)", fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Password
              </label>
              <Link href="/forgot-password">
                <span style={{ color: "oklch(0.6 0.1 300)", fontSize: "0.8rem", cursor: "pointer" }}>Forgot?</span>
              </Link>
            </div>
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
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
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              opacity: loginMutation.isPending ? 0.7 : 1,
              transition: "opacity 150ms, transform 150ms",
            }}
          >
            {loginMutation.isPending ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        {/* Sign up link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "oklch(0.5 0 0)", fontSize: "0.85rem" }}>
          Don't have an account?{" "}
          <Link href="/signup">
            <span style={{ color: "oklch(0.8 0 0)", cursor: "pointer", textDecoration: "underline" }}>Create one</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
