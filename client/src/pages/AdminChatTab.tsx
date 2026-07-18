/**
 * AdminChatTab — Live Chat Panel for Admin
 * Shows all conversations (anonymous + logged-in users).
 * Admin can click any conversation to view the thread and reply.
 * Admin can also initiate a new chat with any registered user.
 * Delete buttons on messages and conversations.
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Send, MessageCircle, User, RefreshCw, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ─── Conversation List ────────────────────────────────────────────────────────
function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const utils = trpc.useUtils();
  const { data: convs, refetch } = trpc.chat.adminListConversations.useQuery(undefined, {
    refetchInterval: 8000,
  });

  const deleteConvMutation = trpc.chat.adminDeleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation deleted");
      utils.chat.adminListConversations.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleDeleteConv = (e: React.MouseEvent, convId: number) => {
    e.stopPropagation();
    if (!confirm("Delete this entire conversation and all its messages?")) return;
    deleteConvMutation.mutate({ conversationId: convId });
  };

  return (
    <div style={{
      width: "280px",
      minWidth: "280px",
      borderRight: "1px solid oklch(1 0 0 / 8%)",
      display: "flex",
      flexDirection: "column",
      height: "600px",
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem",
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)" }}>
          CONVERSATIONS
        </span>
        <button
          onClick={() => refetch()}
          style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(0.50 0 0)", padding: "4px" }}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {!convs || convs.length === 0 ? (
          <div style={{ padding: "2rem 1rem", textAlign: "center", color: "oklch(0.40 0 0)", fontSize: "0.8rem" }}>
            No conversations yet.<br />Users will appear here when they start a chat.
          </div>
        ) : (
          convs.map(conv => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              style={{
                padding: "0.85rem 1rem",
                borderBottom: "1px solid oklch(1 0 0 / 5%)",
                cursor: "pointer",
                background: selectedId === conv.id ? "oklch(0.10 0 0)" : "transparent",
                borderLeft: selectedId === conv.id ? "2px solid #bf5fff" : "2px solid transparent",
                transition: "background 150ms ease",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <User size={12} style={{ color: conv.userId ? "#bf5fff" : "oklch(0.45 0 0)" }} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "oklch(0.90 0 0)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {conv.userName}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {conv.adminUnread > 0 && (
                    <span style={{
                      background: "#bf5fff",
                      color: "#fff",
                      borderRadius: "10px",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}>
                      {conv.adminUnread}
                    </span>
                  )}
                  {/* Delete conversation button */}
                  <button
                    onClick={(e) => handleDeleteConv(e, conv.id)}
                    title="Delete conversation"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "oklch(0.35 0 0)",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.65 0.20 25)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.35 0 0)")}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.72rem",
                color: "oklch(0.45 0 0)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {conv.latestMessage ?? "No messages yet"}
              </div>
              <div style={{ fontSize: "0.62rem", color: "oklch(0.35 0 0)", marginTop: "0.2rem" }}>
                {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────
function ChatThread({ conversationId }: { conversationId: number }) {
  const [message, setMessage] = useState("");
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = trpc.chat.adminGetMessages.useQuery(
    { conversationId },
    { refetchInterval: 5000 }
  );

  const sendMsg = trpc.chat.adminSendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  const deleteMsg = trpc.chat.adminDeleteMessage.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMsg.mutate({ conversationId, body: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!data) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "oklch(0.40 0 0)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "600px" }}>
      {/* Thread header */}
      <div style={{
        padding: "0.85rem 1.25rem",
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}>
        <User size={14} style={{ color: "#bf5fff" }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "oklch(0.90 0 0)" }}>
          {data.conversation?.userName ?? "Unknown"}
        </span>
        {!data.conversation?.userId && (
          <span style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", background: "oklch(0.10 0 0)", padding: "2px 6px", borderRadius: "4px" }}>
            Anonymous
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "oklch(0.40 0 0)", fontSize: "0.8rem", marginTop: "2rem" }}>
            No messages yet. Send the first message below.
          </div>
        ) : (
          data.messages.map(msg => {
            const isDeleted = !!(msg as any).deletedAt;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.senderRole === "admin" ? "flex-end" : "flex-start",
                }}
                onMouseEnter={() => !isDeleted && setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                <div style={{ position: "relative", maxWidth: "70%", display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: msg.senderRole === "admin" ? "row-reverse" : "row" }}>
                  <div style={{
                    padding: "0.6rem 0.9rem",
                    borderRadius: msg.senderRole === "admin" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: isDeleted ? "oklch(0.08 0 0)" : msg.senderRole === "admin" ? "#bf5fff22" : "oklch(0.10 0 0)",
                    border: isDeleted ? "1px solid oklch(1 0 0 / 5%)" : msg.senderRole === "admin" ? "1px solid #bf5fff44" : "1px solid oklch(1 0 0 / 8%)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: isDeleted ? "0.78rem" : "0.82rem",
                    color: isDeleted ? "oklch(0.38 0 0)" : "oklch(0.90 0 0)",
                    lineHeight: 1.5,
                    fontStyle: isDeleted ? "italic" : "normal",
                  }}>
                    {isDeleted ? "This message was removed" : msg.body}
                    <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginTop: "0.3rem", textAlign: msg.senderRole === "admin" ? "right" : "left" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {/* Delete message button — shown on hover, only for non-deleted messages */}
                  {!isDeleted && hoveredMsgId === msg.id && (
                    <button
                      onClick={() => deleteMsg.mutate({ messageId: msg.id })}
                      title="Delete message"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "oklch(0.35 0 0)",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.65 0.20 25)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.35 0 0)")}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "0.85rem 1rem",
        borderTop: "1px solid oklch(1 0 0 / 8%)",
        display: "flex",
        gap: "0.5rem",
        alignItems: "flex-end",
      }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={{
            flex: 1,
            background: "oklch(0.08 0 0)",
            border: "1px solid oklch(1 0 0 / 12%)",
            borderRadius: "8px",
            color: "oklch(0.90 0 0)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.82rem",
            padding: "0.5rem 0.75rem",
            resize: "none",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sendMsg.isPending}
          style={{
            background: message.trim() ? "#bf5fff" : "oklch(0.15 0 0)",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 0.85rem",
            cursor: message.trim() ? "pointer" : "not-allowed",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            transition: "background 150ms ease",
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── New Chat Modal ───────────────────────────────────────────────────────────
function NewChatModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const sendMsg = trpc.chat.adminSendMessage.useMutation({
    onSuccess: (data) => {
      onCreated(data.conversationId);
      onClose();
    },
  });

  const handleSend = () => {
    const uid = parseInt(userId);
    if (!uid || !message.trim()) return;
    sendMsg.mutate({ userId: uid, body: message.trim() });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "oklch(0 0 0 / 70%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div
        style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid oklch(1 0 0 / 12%)",
          borderRadius: "12px",
          padding: "1.75rem",
          width: "400px",
          maxWidth: "90vw",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)" }}>
            NEW CHAT
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(0.50 0 0)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "oklch(0.50 0 0)", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
            User ID
          </label>
          <input
            type="number"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="Enter user ID from Users table"
            style={{
              width: "100%",
              background: "oklch(0.10 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              borderRadius: "6px",
              color: "oklch(0.90 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              padding: "0.5rem 0.75rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "oklch(0.50 0 0)", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            style={{
              width: "100%",
              background: "oklch(0.10 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              borderRadius: "6px",
              color: "oklch(0.90 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.82rem",
              padding: "0.5rem 0.75rem",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!userId || !message.trim() || sendMsg.isPending}
          style={{
            width: "100%",
            background: "#bf5fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.7rem",
            color: "#fff",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.08em",
            cursor: "pointer",
            opacity: (!userId || !message.trim()) ? 0.5 : 1,
          }}
        >
          {sendMsg.isPending ? "SENDING..." : "SEND MESSAGE"}
        </button>
      </div>
    </div>
  );
}

// ─── Main AdminChatTab ────────────────────────────────────────────────────────
export default function AdminChatTab() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", margin: 0 }}>
            LIVE CHAT
          </h2>
          <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
            Manage conversations with your customers. Hover over any message to delete it.
          </p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#bf5fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1rem",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> New Chat
        </button>
      </div>

      {/* Panel */}
      <div style={{
        background: "oklch(0.07 0 0)",
        border: "1px solid oklch(1 0 0 / 8%)",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
      }}>
        <ConversationList selectedId={selectedConvId} onSelect={setSelectedConvId} />

        {selectedConvId ? (
          <ChatThread conversationId={selectedConvId} />
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "oklch(0.40 0 0)",
            gap: "0.75rem",
          }}>
            <MessageCircle size={32} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: "0.85rem" }}>Select a conversation to view messages</span>
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={(id) => {
            setSelectedConvId(id);
            setShowNewChat(false);
          }}
        />
      )}
    </div>
  );
}
