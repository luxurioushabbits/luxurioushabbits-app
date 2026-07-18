import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
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
    registerMutation.mutate({ email, password, name });
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
            Create your account
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="John Doe"
            />
          </div>

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

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "oklch(0.7 0 0)", fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Password
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
              Confirm Password
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
            disabled={registerMutation.isPending}
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
              cursor: registerMutation.isPending ? "not-allowed" : "pointer",
              opacity: registerMutation.isPending ? 0.7 : 1,
              transition: "opacity 150ms, transform 150ms",
            }}
          >
            {registerMutation.isPending ? "Creating account..." : "CREATE ACCOUNT"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", color: "oklch(0.4 0 0)", fontSize: "0.75rem" }}>
            By creating an account, you confirm you are 21+ years of age.
          </p>
        </form>

        {/* Login link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "oklch(0.5 0 0)", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <Link href="/login">
            <span style={{ color: "oklch(0.8 0 0)", cursor: "pointer", textDecoration: "underline" }}>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
