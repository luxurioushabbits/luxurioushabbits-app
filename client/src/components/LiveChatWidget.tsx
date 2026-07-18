/**
 * LiveChatWidget — Floating chat bubble for all visitors (anon + logged-in).
 *
 * - Bottom-right floating button with unread badge
 * - Opens a chat window with full message thread
 * - Works for anonymous users (sessionId in localStorage) and logged-in users
 * - Polls every 8 seconds for new messages from admin
 * - Shows a popup notification when admin sends a message while chat is closed
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// Generate or retrieve a persistent anonymous session ID
function getSessionId(): string {
  const key = "lh_chat_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getStoredConvId(): number | null {
  const v = localStorage.getItem("lh_chat_conv_id");
  return v ? parseInt(v, 10) : null;
}

function storeConvId(id: number) {
  localStorage.setItem("lh_chat_conv_id", String(id));
}

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [sessionId] = useState(() => getSessionId());
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<number | null>(() => getStoredConvId());
  const [input, setInput] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifText, setNotifText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  // Poll for unread count (works without opening chat)
  const { data: unreadData } = trpc.chat.checkUnread.useQuery(
    { conversationId: convId ?? undefined, sessionId },
    { refetchInterval: 8_000, refetchOnWindowFocus: true, staleTime: 0 }
  );

  const unread = unreadData?.unread ?? 0;

  // When unread increases and chat is closed, show notification popup
  useEffect(() => {
    if (unread > prevUnreadRef.current && !open) {
      setShowNotif(true);
      setNotifText("You have a new message from Luxurious Habbits!");
      // Auto-hide after 8 seconds
      const t = setTimeout(() => setShowNotif(false), 8000);
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unread;
  }, [unread, open]);

  // Fetch messages when chat is open
  const { data: msgData, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: convId!, sessionId },
    {
      enabled: open && convId !== null,
      refetchInterval: open ? 5_000 : false,
      staleTime: 0,
    }
  );

  const messages = msgData?.messages ?? [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Create conversation mutation
  const createConv = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (conv) => {
      setConvId(conv.id);
      storeConvId(conv.id);
    },
  });

  // Send message mutation
  const sendMsg = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setInput("");
      refetchMessages();
    },
  });

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setShowNotif(false);
    if (!convId) {
      const displayName = user?.name || "Visitor";
      await createConv.mutateAsync({ sessionId, displayName });
    }
  }, [convId, sessionId, user]);

  const handleSend = useCallback(async () => {
    const body = input.trim();
    if (!body) return;

    let cid = convId;
    if (!cid) {
      const conv = await createConv.mutateAsync({ sessionId, displayName: user?.name || "Visitor" });
      cid = conv.id;
    }
    if (!cid) return;

    sendMsg.mutate({ conversationId: cid, sessionId, body });
  }, [input, convId, sessionId, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Notification popup */}
      {showNotif && !open && (
        <div
          onClick={handleOpen}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 9999,
            background: "oklch(0.08 0 0)",
            border: "1px solid oklch(0.7 0.2 290 / 0.6)",
            borderRadius: "12px",
            padding: "12px 16px",
            maxWidth: "280px",
            cursor: "pointer",
            boxShadow: "0 4px 24px oklch(0.7 0.2 290 / 0.3)",
            animation: "fade-in-up 0.3s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "oklch(0.7 0.2 290)", marginTop: "5px", flexShrink: 0,
              boxShadow: "0 0 6px oklch(0.7 0.2 290)",
            }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em", color: "oklch(0.7 0.2 290)", marginBottom: "2px" }}>
                LUXURIOUS HABBITS
              </div>
              <div style={{ fontSize: "0.85rem", color: "oklch(0.85 0 0)", lineHeight: 1.4 }}>
                {notifText}
              </div>
              <div style={{ fontSize: "0.7rem", color: "oklch(0.5 0 0)", marginTop: "4px" }}>
                Click to reply →
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotif(false); }}
              style={{ background: "none", border: "none", color: "oklch(0.4 0 0)", cursor: "pointer", padding: "0", marginLeft: "auto" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          right: "24px",
          zIndex: 9998,
          width: "340px",
          height: "460px",
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(0.7 0.2 290 / 0.4)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.7 0.2 290 / 0.1)",
          animation: "scale-in 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
          transformOrigin: "bottom right",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid oklch(1 0 0 / 0.06)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "oklch(0.08 0 0)",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "oklch(0.65 0.25 145)",
              boxShadow: "0 0 6px oklch(0.65 0.25 145)",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.12em", color: "oklch(0.9 0 0)" }}>
                LUXURIOUS HABBITS
              </div>
              <div style={{ fontSize: "0.65rem", color: "oklch(0.5 0 0)", letterSpacing: "0.05em" }}>
                We typically reply within minutes
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "oklch(0.5 0 0)", cursor: "pointer", padding: "4px", borderRadius: "6px", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.8 0 0)")}
              onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.5 0 0)")}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "oklch(0.4 0 0)", fontSize: "0.8rem", marginTop: "40px", lineHeight: 1.6 }}>
                <MessageCircle size={28} style={{ margin: "0 auto 8px", opacity: 0.3, display: "block" }} />
                Send us a message and we'll get back to you shortly.
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.senderRole === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: msg.senderRole === "user"
                    ? "12px 12px 2px 12px"
                    : "12px 12px 12px 2px",
                  background: msg.senderRole === "user"
                    ? "oklch(0.7 0.2 290 / 0.25)"
                    : "oklch(0.12 0 0)",
                  border: msg.senderRole === "user"
                    ? "1px solid oklch(0.7 0.2 290 / 0.4)"
                    : "1px solid oklch(1 0 0 / 0.08)",
                  fontSize: "0.85rem",
                  color: "oklch(0.88 0 0)",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}>
                  {msg.body}
                  <div style={{ fontSize: "0.6rem", color: "oklch(0.4 0 0)", marginTop: "4px", textAlign: "right" }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid oklch(1 0 0 / 0.06)",
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            background: "oklch(0.08 0 0)",
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex: 1,
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "oklch(0.9 0 0)",
                fontSize: "0.85rem",
                resize: "none",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.5,
                maxHeight: "100px",
                overflowY: "auto",
              }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 100) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMsg.isPending}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "none",
                background: input.trim() ? "oklch(0.7 0.2 290)" : "oklch(0.2 0 0)",
                color: input.trim() ? "white" : "oklch(0.4 0 0)",
                cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s, transform 0.1s",
                flexShrink: 0,
              }}
              onMouseDown={e => { if (input.trim()) (e.currentTarget as HTMLElement).style.transform = "scale(0.93)"; }}
              onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9997,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "oklch(0.7 0.2 290)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px oklch(0.7 0.2 290 / 0.5)",
          transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px oklch(0.7 0.2 290 / 0.7)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px oklch(0.7 0.2 290 / 0.5)";
        }}
        onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"}
        onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
        aria-label="Open chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "oklch(0.65 0.25 25)",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid oklch(0.04 0 0)",
            boxShadow: "0 0 8px oklch(0.65 0.25 25 / 0.6)",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
