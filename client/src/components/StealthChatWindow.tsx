/**
 * StealthChatWindow.tsx
 *
 * Completely invisible to the user until the admin opens a chat session.
 * Polls userCheckActiveChat every 3 seconds. When an active session is found,
 * a sleek chat window slides up from the bottom-right corner.
 * When admin closes the session, the window auto-dismisses after a brief delay.
 */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, X, MessageCircle, Trash2 } from "lucide-react";

interface Message {
  id: number;
  senderRole: "admin" | "user";
  body: string;
  createdAt: Date;
}

export default function StealthChatWindow() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();

  // Poll for active chat session every 3 seconds
  const { data: activeChatData } = trpc.chat.userCheckActiveChat.useQuery(undefined, {
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  // When active chat data changes, update state
  useEffect(() => {
    if (!activeChatData) {
      // No active chat — if we had one open and it was closed by admin, auto-dismiss
      if (conversationId && isVisible && !isClosed) {
        setIsClosed(true);
        // Show "Chat ended" briefly, then hide after 3 seconds
        setTimeout(() => {
          setIsVisible(false);
          setConversationId(null);
          setMessages([]);
          setIsClosed(false);
        }, 3000);
      }
      return;
    }

    const { conversation, messages: newMessages } = activeChatData;

    // New session opened by admin
    if (!conversationId) {
      setConversationId(conversation.id);
      setMessages(newMessages as Message[]);
      setIsVisible(true);
      setIsMinimized(false);
      setIsClosed(false);
      return;
    }

    // Update messages for existing session
    if (conversation.status === "closed" && !isClosed) {
      setIsClosed(true);
      setMessages(newMessages as Message[]);
      setTimeout(() => {
        setIsVisible(false);
        setConversationId(null);
        setMessages([]);
        setIsClosed(false);
      }, 3000);
      return;
    }

    // Normal message update
    const prevCount = messages.length;
    setMessages(newMessages as Message[]);

    // If new messages arrived while minimized, show unread badge
    if (isMinimized && newMessages.length > prevCount) {
      const newAdminMessages = newMessages.slice(prevCount).filter((m: Message) => m.senderRole === "admin");
      if (newAdminMessages.length > 0) {
        setUnreadCount(c => c + newAdminMessages.length);
      }
    }
  }, [activeChatData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // Focus input when window opens
  useEffect(() => {
    if (isVisible && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible, isMinimized]);

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.userCheckActiveChat.invalidate();
    },
  });

  const deleteMessageMutation = trpc.chat.deleteMessage.useMutation({
    onSuccess: () => {
      utils.chat.userCheckActiveChat.invalidate();
    },
  });

  const handleSend = () => {
    const body = inputValue.trim();
    if (!body || !conversationId) return;

    // Optimistically add message
    const optimistic: Message = {
      id: Date.now(),
      senderRole: "user",
      body,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInputValue("");

    sendMessage.mutate({
      conversationId,
      sessionId: "00000000-0000-0000-0000-000000000000", // logged-in users don't need sessionId
      body,
    });
  };

  const handleDeleteMessage = (messageId: number) => {
    // Optimistically remove from local state
    setMessages(prev => prev.filter(m => m.id !== messageId));
    deleteMessageMutation.mutate({ messageId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setUnreadCount(0);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setUnreadCount(0);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Minimized bubble */}
      {isMinimized && (
        <button
          onClick={handleMaximize}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, oklch(0.45 0.25 290), oklch(0.35 0.20 290))",
            border: "2px solid oklch(0.55 0.25 290)",
            boxShadow: "0 4px 24px oklch(0.45 0.25 290 / 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: "pulse-chat 2s ease-in-out infinite",
          }}
        >
          <MessageCircle size={24} color="white" />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "oklch(0.55 0.25 25)",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Full chat window */}
      {!isMinimized && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: "360px",
            maxWidth: "calc(100vw - 2rem)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 40px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.08)",
            background: "oklch(0.10 0 0)",
            display: "flex",
            flexDirection: "column",
            animation: "slide-up-chat 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            maxHeight: "520px",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, oklch(0.20 0.05 290), oklch(0.15 0.03 290))",
            borderBottom: "1px solid oklch(1 0 0 / 0.08)",
            padding: "0.875rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            {/* Admin avatar */}
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, oklch(0.45 0.25 290), oklch(0.35 0.20 290))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "14px",
              fontWeight: 700,
              color: "white",
            }}>
              LH
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "oklch(0.95 0 0)",
                letterSpacing: "0.01em",
              }}>
                Luxurious Habbits Support
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                color: isClosed ? "oklch(0.55 0.15 25)" : "oklch(0.55 0.15 145)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isClosed ? "oklch(0.55 0.15 25)" : "oklch(0.65 0.20 145)",
                  display: "inline-block",
                }} />
                {isClosed ? "Chat ended" : "Active"}
              </div>
            </div>
            <button
              onClick={handleMinimize}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "oklch(0.50 0 0)",
                padding: "4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.80 0 0)")}
              onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.50 0 0)")}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
            minHeight: "200px",
            maxHeight: "340px",
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: "center",
                color: "oklch(0.40 0 0)",
                fontSize: "0.8rem",
                fontFamily: "'Inter', sans-serif",
                marginTop: "2rem",
              }}>
                Support has connected. Say hello!
              </div>
            )}
            {messages.map((msg) => {
              const isDeleted = !!(msg as any).deletedAt;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.senderRole === "user" ? "flex-end" : "flex-start",
                  }}
                  onMouseEnter={() => !isDeleted && setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                >
                  <div style={{ position: "relative", maxWidth: "80%", display: "flex", alignItems: "flex-end", gap: "4px", flexDirection: msg.senderRole === "user" ? "row-reverse" : "row" }}>
                    <div style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: msg.senderRole === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                      background: isDeleted
                        ? "oklch(0.12 0 0)"
                        : msg.senderRole === "user"
                          ? "linear-gradient(135deg, oklch(0.45 0.25 290), oklch(0.38 0.22 290))"
                          : "oklch(0.18 0 0)",
                      color: isDeleted ? "oklch(0.38 0 0)" : "oklch(0.95 0 0)",
                      fontSize: isDeleted ? "0.8rem" : "0.875rem",
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      border: isDeleted
                        ? "1px solid oklch(1 0 0 / 0.04)"
                        : msg.senderRole === "admin" ? "1px solid oklch(1 0 0 / 0.06)" : "none",
                      fontStyle: isDeleted ? "italic" : "normal",
                    }}>
                      {isDeleted ? "This message was removed" : msg.body}
                    </div>
                    {/* Delete button — only for user's own non-deleted messages, shown on hover */}
                    {!isDeleted && msg.senderRole === "user" && hoveredMsgId === msg.id && !isClosed && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        title="Delete message"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "oklch(0.40 0 0)",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.65 0.20 25)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.40 0 0)")}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {isClosed && (
              <div style={{
                textAlign: "center",
                color: "oklch(0.45 0 0)",
                fontSize: "0.75rem",
                fontFamily: "'Inter', sans-serif",
                fontStyle: "italic",
                marginTop: "0.5rem",
              }}>
                This chat session has ended.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {!isClosed && (
            <div style={{
              borderTop: "1px solid oklch(1 0 0 / 0.08)",
              padding: "0.75rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-end",
              background: "oklch(0.08 0 0)",
            }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                style={{
                  flex: 1,
                  background: "oklch(0.14 0 0)",
                  border: "1px solid oklch(1 0 0 / 0.10)",
                  borderRadius: "10px",
                  padding: "0.5rem 0.75rem",
                  color: "oklch(0.92 0 0)",
                  fontSize: "0.875rem",
                  fontFamily: "'Inter', sans-serif",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.5,
                  maxHeight: "100px",
                  overflowY: "auto",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "oklch(0.55 0.25 290 / 0.6)")}
                onBlur={e => (e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.10)")}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sendMessage.isPending}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: inputValue.trim()
                    ? "linear-gradient(135deg, oklch(0.50 0.25 290), oklch(0.40 0.22 290))"
                    : "oklch(0.18 0 0)",
                  border: "none",
                  cursor: inputValue.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s, transform 0.1s",
                }}
                onMouseDown={e => inputValue.trim() && (e.currentTarget.style.transform = "scale(0.93)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Send size={15} color={inputValue.trim() ? "white" : "oklch(0.35 0 0)"} />
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-up-chat {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes pulse-chat {
          0%, 100% { box-shadow: 0 4px 24px oklch(0.45 0.25 290 / 0.5); }
          50%       { box-shadow: 0 4px 32px oklch(0.45 0.25 290 / 0.8); }
        }
      `}</style>
    </>
  );
}
