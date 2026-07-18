import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.message || "Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    forgotMutation.mutate({ email, origin: window.location.origin });
  };

  if (sent) {
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
            <h2 style={{ color: "oklch(0.9 0 0)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>Check Your Email</h2>
            <p style={{ color: "oklch(0.6 0 0)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              If an account exists for <strong style={{ color: "oklch(0.8 0 0)" }}>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
            </p>
          </div>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/login">
              <span style={{ color: "oklch(0.6 0.1 300)", fontSize: "0.85rem", cursor: "pointer" }}>← Back to login</span>
            </Link>
          </p>
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
            Reset your password
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

          <p style={{ color: "oklch(0.6 0 0)", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
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

          <button
            type="submit"
            disabled={forgotMutation.isPending}
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
              cursor: forgotMutation.isPending ? "not-allowed" : "pointer",
              opacity: forgotMutation.isPending ? 0.7 : 1,
            }}
          >
            {forgotMutation.isPending ? "Sending..." : "SEND RESET LINK"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/login">
            <span style={{ color: "oklch(0.6 0.1 300)", fontSize: "0.85rem", cursor: "pointer" }}>← Back to login</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
