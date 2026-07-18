/**
 * Navbar — Luxurious Habbits
 * Black luxury, ultra-thin, gold accents, glitch logo on hover
 * Includes login/logout with user avatar dropdown
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag, User, LogOut, Settings, Package, UserCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import WalletConnectButton from "@/components/WalletConnectButton";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "The Habbits Box ✦", href: "/habbits-box", highlight: true },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Journal", href: "/blog" },
  { label: "COA", href: "/coa" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

type NavLink = { label: string; href: string; highlight?: boolean };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });
  const { data: profile } = trpc.profile.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const photoUrl = profile?.profilePhotoKey ? `/manus-storage/${profile.profilePhotoKey}` : null;
  const displayName = profile?.nickname || user?.name || "Account";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <a href={getLoginUrl()} style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "none",
              border: "1px solid oklch(1 0 0 / 12%)",
              color: "oklch(0.70 0 0)",
              padding: "6px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#bf5fff";
              (e.currentTarget as HTMLElement).style.color = "#bf5fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 12%)";
              (e.currentTarget as HTMLElement).style.color = "oklch(0.70 0 0)";
            }}
          >
            <User size={13} /> Sign In
          </button>
        </a>
        <WalletConnectButton mode="login" />
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isAdmin = (user as any)?.role === "admin";
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: photoUrl ? "transparent" : "oklch(0.10 0 0)",
          border: `1px solid ${photoUrl ? "oklch(1 0 0 / 20%)" : "oklch(1 0 0 / 12%)"}`,
          color: "oklch(0.85 0 0)",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          cursor: "pointer",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 150ms ease",
          flexShrink: 0,
          overflow: "hidden",
          padding: 0,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#bf5fff"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = photoUrl ? "oklch(1 0 0 / 20%)" : "oklch(1 0 0 / 12%)"}
        aria-label="Account menu"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : initials}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 12%)",
          borderRadius: "8px",
          minWidth: "200px",
          zIndex: 200,
          overflow: "hidden",
          boxShadow: "0 8px 32px oklch(0 0 0 / 60%)",
        }}>
          {/* User info header */}
          <div style={{ padding: "1rem", borderBottom: "1px solid oklch(1 0 0 / 8%)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {photoUrl && (
              <img src={photoUrl} alt="Profile" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid oklch(1 0 0 / 15%)" }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.85 0 0)", fontWeight: 500 }}>
              {displayName}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.40 0 0)", marginTop: "2px" }}>
              {user?.email ?? ""}
            </div>
            {isAdmin && (
              <div style={{
                marginTop: "6px",
                display: "inline-block",
                background: "#bf5fff22",
                border: "1px solid #bf5fff44",
                borderRadius: "3px",
                padding: "2px 8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bf5fff",
              }}>
                Admin
              </div>
            )}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "0.4rem 0" }}>
            <Link href="/account" onClick={() => setOpen(false)}>
              <div style={{ ...menuItemStyle, color: "#bf5fff", fontWeight: 600 }}>
                <UserCircle size={13} /> Edit Profile
              </div>
            </Link>
            <div style={{ height: "1px", background: "oklch(1 0 0 / 8%)", margin: "0.2rem 0" }} />
            <Link href="/account" onClick={() => setOpen(false)}>
              <div style={menuItemStyle}>
                <Package size={13} /> My Orders
              </div>
            </Link>
            <Link href="/my-subscription" onClick={() => setOpen(false)}>
              <div style={menuItemStyle}>
                <User size={13} /> My Subscription
              </div>
            </Link>
            {isAdmin && (
              <>
                <div style={{ height: "1px", background: "oklch(1 0 0 / 8%)", margin: "0.4rem 0" }} />
                <Link href="/admin" onClick={() => setOpen(false)}>
                  <div style={{ ...menuItemStyle, color: "#bf5fff" }}>
                    <Settings size={13} /> Admin Panel
                  </div>
                </Link>
              </>
            )}
            <div style={{ height: "1px", background: "oklch(1 0 0 / 8%)", margin: "0.4rem 0" }} />
            <button
              onClick={() => { setOpen(false); logout.mutate(); }}
              style={{ ...menuItemStyle, background: "none", border: "none", width: "100%", cursor: "pointer", color: "oklch(0.45 0 0)" }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.6rem 1rem",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.78rem",
  color: "oklch(0.65 0 0)",
  cursor: "pointer",
  transition: "background 120ms ease, color 120ms ease",
  textDecoration: "none",
};

function MobileAuthSection() {
  const { user, isAuthenticated } = useAuth();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", width: "100%", maxWidth: "280px" }}>
        <a href={getLoginUrl()} style={{ textDecoration: "none", width: "100%" }}>
          <button style={{
            width: "100%",
            background: "none",
            border: "1px solid oklch(1 0 0 / 20%)",
            color: "oklch(0.75 0 0)",
            padding: "12px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}>
            <User size={14} /> Sign In
          </button>
        </a>
        <div style={{ width: "100%" }}>
          <WalletConnectButton mode="login" />
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", width: "100%", maxWidth: "280px" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.65 0 0)", textAlign: "center" }}>
        Signed in as <span style={{ color: "oklch(0.85 0 0)" }}>{user?.name ?? initials}</span>
      </div>
      {user?.role === "admin" && (
        <Link href="/admin" style={{ width: "100%", textDecoration: "none" }}>
          <button style={{
            width: "100%",
            background: "oklch(0.55 0.18 300 / 0.15)",
            border: "1px solid #bf5fff55",
            color: "#bf5fff",
            padding: "11px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontWeight: 600,
          }}>
            <Settings size={13} /> Admin Panel
          </button>
        </Link>
      )}
      <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
        <Link href="/account" style={{ flex: 1, textDecoration: "none" }}>
          <button style={{
            width: "100%",
            background: "none",
            border: "1px solid oklch(1 0 0 / 15%)",
            color: "oklch(0.65 0 0)",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}>
            <Package size={13} /> Orders
          </button>
        </Link>
        <button
          onClick={() => logout.mutate()}
          style={{
            flex: 1,
            background: "none",
            border: "1px solid oklch(1 0 0 / 15%)",
            color: "oklch(0.45 0 0)",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { itemCount, openCart } = useCart();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 300ms ease",
          background: scrolled ? "oklch(0.04 0 0 / 95%)" : "oklch(0.04 0 0 / 60%)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid oklch(1 0 0 / 8%)" : "1px solid oklch(1 0 0 / 4%)",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px", gap: "1rem" }}>
          {/* Logo */}
          <Link href="/">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
              <div className="logo-glitch-wrap">
                <img src="/manus-storage/logo_14152948.png" alt="Luxurious Habbits Logo" style={{ width: "40px", height: "40px", objectFit: "contain", display: "block" }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1rem",
                  letterSpacing: "0.18em",
                  color: "oklch(0.96 0 0)",
                  lineHeight: 1,
                }}>
                  LUXURIOUS HABBITS
                </div>
                <div className="text-holo" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.48rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}>
                  Premium Hemp
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isDesktop && (
            <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center", flex: 1, justifyContent: "center", flexWrap: "nowrap", overflow: "visible" }}>
              {(navLinks as NavLink[]).map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`nav-link${location === link.href ? " active" : ""}`}
                    style={{
                      whiteSpace: "nowrap",
                      ...(link.highlight ? { color: "#bf5fff", fontWeight: 600 } : {}),
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side: Account + Cart + Mobile Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            {/* User Account */}
            {isDesktop && <UserMenu />}

            {/* Cart Icon */}
            <button
              onClick={openCart}
              style={{ background: "none", border: "none", color: "oklch(0.70 0 0)", padding: "8px", cursor: "pointer", position: "relative", transition: "color 150ms ease" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#bf5fff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.70 0 0)"}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span style={{ position: "absolute", top: "2px", right: "2px", background: "#bf5fff", color: "oklch(0.04 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Toggle — only on small screens */}
            {!isDesktop && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: "none", border: "none", color: "#bf5fff", padding: "8px", cursor: "pointer" }}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && !isDesktop && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "oklch(0.04 0 0 / 98%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto",
            paddingTop: "5rem",
            paddingBottom: "2rem",
            gap: "0",
          }}
        >
          {(navLinks as NavLink[]).map((link, i) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              style={{ width: "100%", textAlign: "center", padding: "0.6rem 1.5rem", textDecoration: "none" }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.75rem",
                  letterSpacing: "0.2em",
                  color: location === link.href ? "#bf5fff" : (link.highlight ? "#bf5fff" : "oklch(0.75 0 0)"),
                  textDecoration: "none",
                  display: "block",
                  transition: "color 200ms ease",
                  opacity: 1,
                }}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <div style={{ height: "1px", background: "oklch(1 0 0 / 10%)", width: "120px", margin: "1rem 0" }} />
          {/* Mobile account links — full-width layout */}
          <MobileAuthSection />
        </div>
      )}
    </>
  );
}
