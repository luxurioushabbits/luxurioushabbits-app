import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Megaphone, Tag, Info, Send, Users, User, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

type MessageType = "info" | "promo" | "alert";

const TYPE_LABELS: Record<MessageType, { label: string; color: string; icon: React.ReactNode }> = {
  info: { label: "Info", color: "#60a5fa", icon: <Info size={14} /> },
  promo: { label: "Promo", color: "#34d399", icon: <Tag size={14} /> },
  alert: { label: "Alert", color: "#fb923c", icon: <Megaphone size={14} /> },
};

// ─── Inline Edit Form ─────────────────────────────────────────────────────────
function InlineEditForm({
  msg,
  onDone,
}: {
  msg: { id: number; title: string; message: string; type: string | null };
  onDone: () => void;
}) {
  const [title, setTitle] = useState(msg.title);
  const [message, setMessage] = useState(msg.message);
  const [type, setType] = useState<MessageType>((msg.type as MessageType) ?? "info");
  const { refetch } = trpc.adminMessages.list.useQuery();

  const editMutation = trpc.adminMessages.editMessage.useMutation({
    onSuccess: () => {
      toast.success("Message updated");
      refetch();
      onDone();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "oklch(0.13 0 0)",
    border: "1px solid oklch(1 0 0 / 12%)",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
    color: "oklch(0.90 0 0)",
    fontSize: "0.82rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {/* Type selector */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {(Object.entries(TYPE_LABELS) as [MessageType, typeof TYPE_LABELS[MessageType]][]).map(([t, cfg]) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1,
              padding: "0.35rem",
              borderRadius: "5px",
              border: `1px solid ${type === t ? cfg.color : "oklch(1 0 0 / 10%)"}`,
              background: type === t ? `${cfg.color}18` : "oklch(0.10 0 0)",
              color: type === t ? cfg.color : "oklch(0.55 0 0)",
              cursor: "pointer",
              fontSize: "0.72rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            }}
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={inputStyle}
        maxLength={255}
      />

      {/* Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message body"
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button
          onClick={onDone}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: "1px solid oklch(1 0 0 / 10%)",
            background: "oklch(0.12 0 0)",
            color: "oklch(0.60 0 0)",
            cursor: "pointer",
            fontSize: "0.78rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <X size={13} /> Cancel
        </button>
        <button
          onClick={() => editMutation.mutate({ messageId: msg.id, title, message, type })}
          disabled={!title.trim() || !message.trim() || editMutation.isPending}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: "none",
            background: "oklch(0.55 0.18 280)",
            color: "white",
            cursor: "pointer",
            fontSize: "0.78rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            opacity: (!title.trim() || !message.trim()) ? 0.5 : 1,
          }}
        >
          <Check size={13} /> {editMutation.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export default function AdminMessagesTab() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<MessageType>("info");
  const [targetMode, setTargetMode] = useState<"broadcast" | "user">("broadcast");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: users } = trpc.adminMessages.listUsers.useQuery();
  const { data: sentMessages, refetch: refetchSent } = trpc.adminMessages.list.useQuery();
  const sendMutation = trpc.adminMessages.send.useMutation({
    onSuccess: () => {
      toast.success("Message sent!");
      setTitle("");
      setMessage("");
      setSelectedUserId(null);
      refetchSent();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deleteMutation = trpc.adminMessages.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      refetchSent();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (targetMode === "user" && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    sendMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      type,
      userId: targetMode === "user" ? selectedUserId! : undefined,
    });
  };

  const handleDelete = (msgId: number) => {
    if (!confirm("Delete this message? Users who haven't seen it won't receive it.")) return;
    deleteMutation.mutate({ messageId: msgId });
  };

  const card = {
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 8%)",
    borderRadius: "10px",
    padding: "1.5rem",
  };

  const input = {
    width: "100%",
    background: "oklch(0.10 0 0)",
    border: "1px solid oklch(1 0 0 / 10%)",
    borderRadius: "6px",
    padding: "0.6rem 0.9rem",
    color: "oklch(0.90 0 0)",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", padding: "1.5rem" }}>
      {/* Compose panel */}
      <div style={card}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.90 0 0)", marginBottom: "1.25rem" }}>
          COMPOSE MESSAGE
        </h3>

        {/* Target mode */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {(["broadcast", "user"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTargetMode(mode)}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid oklch(1 0 0 / 10%)",
                background: targetMode === mode ? "oklch(0.55 0.18 280)" : "oklch(0.10 0 0)",
                color: "oklch(0.90 0 0)",
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              {mode === "broadcast" ? <Users size={14} /> : <User size={14} />}
              {mode === "broadcast" ? "Broadcast to All" : "Specific User"}
            </button>
          ))}
        </div>

        {/* User selector */}
        {targetMode === "user" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "oklch(0.5 0 0)", marginBottom: "0.4rem", letterSpacing: "0.1em" }}>SELECT USER</label>
            <select
              value={selectedUserId ?? ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
              style={{ ...input }}
            >
              <option value="">— Choose a user —</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email} {u.name && u.email ? `(${u.email})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message type */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: "oklch(0.5 0 0)", marginBottom: "0.4rem", letterSpacing: "0.1em" }}>TYPE</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(Object.entries(TYPE_LABELS) as [MessageType, typeof TYPE_LABELS[MessageType]][]).map(([t, cfg]) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: "0.45rem",
                  borderRadius: "6px",
                  border: `1px solid ${type === t ? cfg.color : "oklch(1 0 0 / 10%)"}`,
                  background: type === t ? `${cfg.color}18` : "oklch(0.10 0 0)",
                  color: type === t ? cfg.color : "oklch(0.55 0 0)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: "oklch(0.5 0 0)", marginBottom: "0.4rem", letterSpacing: "0.1em" }}>TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flash Sale — 20% Off Today Only"
            style={input}
            maxLength={255}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: "oklch(0.5 0 0)", marginBottom: "0.4rem", letterSpacing: "0.1em" }}>MESSAGE</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={4}
            style={{ ...input, resize: "vertical" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sendMutation.isPending}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "oklch(0.55 0.18 280)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.15em",
            cursor: sendMutation.isPending ? "not-allowed" : "pointer",
            opacity: sendMutation.isPending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <Send size={16} />
          {sendMutation.isPending ? "SENDING..." : "SEND MESSAGE"}
        </button>
      </div>

      {/* Sent messages history */}
      <div style={card}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.90 0 0)", marginBottom: "1.25rem" }}>
          SENT MESSAGES
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "500px", overflowY: "auto" }}>
          {!sentMessages || sentMessages.length === 0 ? (
            <p style={{ color: "oklch(0.4 0 0)", fontSize: "0.85rem", fontStyle: "italic" }}>No messages sent yet.</p>
          ) : (
            sentMessages.map((msg) => {
              const cfg = TYPE_LABELS[(msg.type ?? "info") as MessageType] ?? TYPE_LABELS.info;
              const isEditing = editingId === msg.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    background: "oklch(0.10 0 0)",
                    border: `1px solid ${cfg.color}22`,
                    borderLeft: `3px solid ${cfg.color}`,
                    borderRadius: "6px",
                    padding: "0.85rem 1rem",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, color: "oklch(0.88 0 0)", fontSize: "0.9rem", flex: 1, marginRight: "0.5rem" }}>
                      {msg.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.7rem", color: cfg.color, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {/* Edit button */}
                      <button
                        onClick={() => setEditingId(isEditing ? null : msg.id)}
                        title={isEditing ? "Cancel edit" : "Edit message"}
                        style={{
                          background: isEditing ? "oklch(0.55 0.18 280 / 0.2)" : "none",
                          border: isEditing ? "1px solid oklch(0.55 0.18 280 / 0.4)" : "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: isEditing ? "oklch(0.70 0.18 280)" : "oklch(0.40 0 0)",
                          padding: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => !isEditing && (e.currentTarget.style.color = "oklch(0.70 0.18 280)")}
                        onMouseLeave={e => !isEditing && (e.currentTarget.style.color = "oklch(0.40 0 0)")}
                      >
                        <Pencil size={12} />
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        title="Delete message"
                        disabled={deleteMutation.isPending}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "oklch(0.35 0 0)",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.65 0.20 25)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.35 0 0)")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing ? (
                    <InlineEditForm
                      msg={msg}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.82rem", margin: "0 0 0.4rem", lineHeight: 1.5 }}>{msg.message}</p>
                      <div style={{ fontSize: "0.7rem", color: "oklch(0.38 0 0)" }}>
                        {msg.userId ? `→ User #${msg.userId}` : "→ Broadcast to all"} · {new Date(msg.createdAt).toLocaleString()}
                      </div>
                      {/* User replies */}
                      {(msg as any).replies && (msg as any).replies.length > 0 && (
                        <div style={{ marginTop: "0.6rem", borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", textTransform: "uppercase" }}>User Replies</div>
                          {(msg as any).replies.map((r: any) => (
                            <div key={r.id} style={{ background: "oklch(0.13 0 0)", borderRadius: "6px", padding: "0.5rem 0.75rem", borderLeft: `2px solid ${cfg.color}` }}>
                              <p style={{ color: "oklch(0.82 0 0)", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>{r.reply}</p>
                              <div style={{ fontSize: "0.65rem", color: "oklch(0.38 0 0)", marginTop: "0.2rem" }}>{new Date(r.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
