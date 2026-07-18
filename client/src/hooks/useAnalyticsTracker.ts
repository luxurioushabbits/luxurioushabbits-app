/**
 * useAnalyticsTracker — Lightweight page view + heartbeat tracker
 *
 * - Generates a stable sessionId per browser tab (sessionStorage)
 * - Fires a page view on every route change
 * - Sends a heartbeat every 30s to keep the "active visitors" count accurate
 * - Tracks ALL users including admins (admins are flagged so they appear with ADMIN badge in the panel)
 * - Sends timezone, browser language, and referrer for richer anonymous visitor profiles
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trackPageView } from "./useAnalytics";

function getSessionId(): string {
  const key = "lh_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function getBrowserLanguage(): string | null {
  try {
    return navigator.language ?? null;
  } catch {
    return null;
  }
}

export function useAnalyticsTracker() {
  const [location] = useLocation();
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPathRef = useRef<string>("");

  const isAdmin = user?.role === "admin";

  // Track page view on route change
  useEffect(() => {
    if (location === lastPathRef.current) return;
    lastPathRef.current = location;

    const sessionId = getSessionId();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path: location,
        referrer: document.referrer || null,
        isAdmin,
      }),
    }).catch(() => {});

    // Also fire GA4 page view (skip for admins to avoid inflating analytics)
    if (!isAdmin) trackPageView(location);
  }, [location, isAdmin]);

  // Heartbeat every 30 seconds
  useEffect(() => {
    const sendHeartbeat = () => {
      const sessionId = getSessionId();
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          path: window.location.pathname,
          isAdmin,
          timezone: getTimezone(),
          browserLanguage: getBrowserLanguage(),
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 30 seconds
    heartbeatRef.current = setInterval(sendHeartbeat, 30_000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [isAdmin]);
}
