import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { X, Megaphone, Tag, Info, Send } from "lucide-react";

type MessageType = "info" | "promo" | "alert";

const TYPE_CONFIG: Record<MessageType, { icon: React.ReactNode; color: string; label: string }> = {
  info: {
    icon: <Info size={32} />,
    color: "#00f5ff",
    label: "MESSAGE FROM THE TEAM",
  },
  promo: {
    icon: <Tag size={32} />,
    color: "#00e5a0",
    label: "EXCLUSIVE OFFER",
  },
  alert: {
    icon: <Megaphone size={32} />,
    color: "#f5a623",
    label: "IMPORTANT NOTICE",
  },
};

export default function AdminMessagePopup() {
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);

  const { data: pendingMessage, refetch } = trpc.adminMessages.checkPending.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const dismissMutation = trpc.adminMessages.dismiss.useMutation({
    onSuccess: () => {
      setVisible(false);
      setCurrentMessageId(null);
      setReplyText("");
      setReplySent(false);
      setTimeout(() => refetch(), 500);
    },
  });

  const replyMutation = trpc.adminMessages.reply.useMutation({
    onSuccess: () => {
      setReplySent(true);
      setReplyText("");
    },
    onError: (err) => {
      alert(`Reply error: ${err.message}`);
    },
  });

  useEffect(() => {
    if (pendingMessage && pendingMessage.id !== currentMessageId) {
      setCurrentMessageId(pendingMessage.id);
      setVisible(true);
      setReplySent(false);
      setReplyText("");
    }
  }, [pendingMessage, currentMessageId]);

  const handleDismiss = () => {
    if (currentMessageId !== null) {
      dismissMutation.mutate({ messageId: currentMessageId });
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || currentMessageId === null) return;
    replyMutation.mutate({ messageId: currentMessageId, reply: replyText.trim() });
  };

  if (!visible || !pendingMessage) return null;

  const msgType = (pendingMessage.type ?? "info") as MessageType;
  const config = TYPE_CONFIG[msgType] ?? TYPE_CONFIG.info;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <div
        style={{
          background: "oklch(0.07 0 0)",
          border: `1px solid ${config.color}55`,
          borderRadius: "20px",
          padding: "2.5rem",
          maxWidth: "560px",
          width: "92%",
          position: "relative",
          boxShadow: `0 0 80px ${config.color}20, 0 24px 80px rgba(0,0,0,0.7)`,
          animation: "scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: "1.1rem",
            right: "1.1rem",
            background: "rgba(255,255,255,0.07)",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "6px",
            lineHeight: 1,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Dismiss message"
        >
          <X size={18} />
        </button>

        {/* Icon + label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.1rem" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `${config.color}18`,
              border: `2px solid ${config.color}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.color,
            }}
          >
            {config.icon}
          </div>

          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: config.color,
            }}
          >
            {config.label}
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
              letterSpacing: "0.06em",
              color: "#ffffff",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {pendingMessage.title}
          </h2>

          {/* Message body */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.1rem",
              color: "#ffffff",
              lineHeight: 1.75,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {pendingMessage.message}
          </p>

          {/* Reply section */}
          <div style={{ width: "100%", marginTop: "0.5rem" }}>
            {replySent ? (
              <div style={{
                padding: "0.75rem 1rem",
                background: `${config.color}18`,
                border: `1px solid ${config.color}44`,
                borderRadius: "10px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                color: config.color,
                textAlign: "center",
              }}>
                ✓ Reply sent!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Reply to this message... (optional)"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.95rem",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {replyText.trim() && (
                  <button
                    onClick={handleReply}
                    disabled={replyMutation.isPending}
                    style={{
                      padding: "0.65rem 1.5rem",
                      background: config.color,
                      color: "oklch(0.05 0 0)",
                      border: "none",
                      borderRadius: "8px",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "opacity 0.15s",
                      opacity: replyMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    <Send size={15} />
                    {replyMutation.isPending ? "Sending..." : "Send Reply"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            disabled={dismissMutation.isPending}
            style={{
              marginTop: "0.25rem",
              padding: "0.85rem 3rem",
              background: config.color,
              color: "oklch(0.04 0 0)",
              border: "none",
              borderRadius: "8px",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem",
              letterSpacing: "0.2em",
              cursor: "pointer",
              transition: "opacity 0.15s",
              opacity: dismissMutation.isPending ? 0.6 : 1,
              width: "100%",
            }}
          >
            {dismissMutation.isPending ? "..." : "GOT IT"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
