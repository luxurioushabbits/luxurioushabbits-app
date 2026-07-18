/**
 * Admin Blog Editor
 * Create, edit, publish, and delete blog articles from the admin panel.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, ChevronLeft, Save, Globe, FileText, X
} from "lucide-react";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string | null;
  coverImage: string | null;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const CATEGORIES = [
  "General",
  "Strain Guide",
  "Terpene Guide",
  "Education",
  "News",
  "Product Spotlight",
  "Lifestyle",
];

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "General",
  tags: [] as string[],
  coverImage: "",
  authorName: "Luxurious Habbits",
  metaTitle: "",
  metaDescription: "",
  readTimeMinutes: 5,
  isPublished: false,
};

export default function BlogEditor() {
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");

  const utils = trpc.useUtils();
  const { data: posts = [], isLoading } = trpc.blog.adminList.useQuery();

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Article created!");
      utils.blog.adminList.invalidate();
      setView("list");
      setForm({ ...emptyForm });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Article saved!");
      utils.blog.adminList.invalidate();
      setView("list");
      setEditingId(null);
      setForm({ ...emptyForm });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted");
      utils.blog.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const togglePublish = (post: Post) => {
    updateMutation.mutate({ id: post.id, isPublished: !post.isPublished });
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      category: post.category,
      tags: (() => { try { return JSON.parse(post.tags ?? "[]"); } catch { return []; } })(),
      coverImage: post.coverImage ?? "",
      authorName: post.authorName,
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      readTimeMinutes: post.readTimeMinutes,
      isPublished: post.isPublished,
    });
    setView("edit");
  };

  const startNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setView("edit");
  };

  const handleSave = (publish?: boolean) => {
    const payload = {
      ...form,
      excerpt: form.excerpt || undefined,
      coverImage: form.coverImage || undefined,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      isPublished: publish !== undefined ? publish : form.isPublished,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── EDITOR VIEW ──────────────────────────────────────────────────────────
  if (view === "edit") {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <button
              onClick={() => { setView("list"); setEditingId(null); setForm({ ...emptyForm }); }}
              style={{ background: "none", border: "none", color: "oklch(0.55 0 0)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", letterSpacing: "0.1em" }}
            >
              <ChevronLeft size={16} /> Back to Articles
            </button>
            <div style={{ flex: 1 }} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              style={{ borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.7 0 0)" }}
            >
              <Save size={14} style={{ marginRight: "0.4rem" }} />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              style={{ background: "linear-gradient(135deg, #bf5fff, #7c3aed)", color: "white", border: "none" }}
            >
              <Globe size={14} style={{ marginRight: "0.4rem" }} />
              {editingId && form.isPublished ? "Update & Keep Live" : "Publish"}
            </Button>
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "2rem" }}>
            {editingId ? "Edit Article" : "New Article"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Title *</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Blue Dream THCA Flower: Full Strain Review"
                style={inputStyle}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label style={labelStyle}>Excerpt (shown in article cards)</label>
              <Textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="A short 1–2 sentence summary..."
                rows={2}
                style={inputStyle}
              />
            </div>

            {/* Content */}
            <div>
              <label style={labelStyle}>Content * (Markdown supported)</label>
              <Textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your article here. Markdown is supported: **bold**, # Heading, - list, etc."
                rows={18}
                style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.7 }}
              />
            </div>

            {/* Row: Category + Read Time */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Read Time (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={form.readTimeMinutes}
                  onChange={e => setForm(f => ({ ...f, readTimeMinutes: parseInt(e.target.value) || 5 }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                {form.tags.map(tag => (
                  <Badge
                    key={tag}
                    style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.7 0 0)", cursor: "pointer", gap: "0.3rem" }}
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X size={10} />
                  </Badge>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag, press Enter"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <Button variant="outline" size="sm" onClick={addTag} style={{ borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.7 0 0)" }}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label style={labelStyle}>Cover Image URL</label>
              <Input
                value={form.coverImage}
                onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://... or /manus-storage/..."
                style={inputStyle}
              />
              {form.coverImage && (
                <img src={form.coverImage} alt="Cover preview" style={{ marginTop: "0.5rem", maxHeight: "120px", borderRadius: "6px", objectFit: "cover" }} />
              )}
            </div>

            {/* Author */}
            <div>
              <label style={labelStyle}>Author Name</label>
              <Input
                value={form.authorName}
                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* SEO */}
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1.25rem" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "oklch(0.45 0 0)", textTransform: "uppercase", marginBottom: "1rem" }}>SEO (optional)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Meta Title (leave blank to use article title)</label>
                  <Input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="Overrides title in search results" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Meta Description (120–160 chars)</label>
                  <Textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={2} placeholder="Short summary for search results..." style={inputStyle} />
                  <p style={{ fontSize: "0.7rem", color: form.metaDescription.length > 160 ? "#ff4444" : "oklch(0.4 0 0)", marginTop: "0.25rem" }}>
                    {form.metaDescription.length}/160 chars
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "oklch(0.45 0 0)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Admin</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>Blog Articles</h2>
          </div>
          <Button
            onClick={startNew}
            style={{ background: "linear-gradient(135deg, #bf5fff, #7c3aed)", color: "white", border: "none" }}
          >
            <Plus size={16} style={{ marginRight: "0.4rem" }} /> New Article
          </Button>
        </div>

        {isLoading ? (
          <p style={{ color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>Loading...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 12%)", borderRadius: "12px" }}>
            <FileText size={32} style={{ color: "oklch(0.3 0 0)", marginBottom: "1rem" }} />
            <p style={{ color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif" }}>No articles yet. Create your first one.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(posts as Post[]).map(post => (
              <div
                key={post.id}
                style={{
                  background: "oklch(0.08 0 0)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderLeft: `3px solid ${post.isPublished ? "#22c55e" : "oklch(1 0 0 / 15%)"}`,
                  borderRadius: "8px",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "oklch(0.92 0 0)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.title}
                    </p>
                    <Badge style={{ background: post.isPublished ? "oklch(0.15 0.08 145)" : "oklch(0.12 0 0)", color: post.isPublished ? "#22c55e" : "oklch(0.45 0 0)", border: `1px solid ${post.isPublished ? "#22c55e33" : "oklch(1 0 0 / 10%)"}`, fontSize: "0.6rem", letterSpacing: "0.1em" }}>
                      {post.isPublished ? "LIVE" : "DRAFT"}
                    </Badge>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)" }}>
                    {post.category} · {post.readTimeMinutes} min read · {post.publishedAt ? `Published ${new Date(post.publishedAt).toLocaleDateString()}` : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(post)}
                    disabled={updateMutation.isPending}
                    title={post.isPublished ? "Unpublish" : "Publish"}
                    style={{ borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.6 0 0)", padding: "0.4rem" }}
                  >
                    {post.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(post)}
                    style={{ borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.6 0 0)", padding: "0.4rem" }}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                        deleteMutation.mutate({ id: post.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    style={{ borderColor: "oklch(1 0 0 / 15%)", color: "#ff4444", padding: "0.4rem" }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  color: "oklch(0.50 0 0)",
  textTransform: "uppercase",
  marginBottom: "0.4rem",
};

const inputStyle: React.CSSProperties = {
  background: "oklch(0.08 0 0)",
  border: "1px solid oklch(1 0 0 / 12%)",
  color: "oklch(0.92 0 0)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem",
  width: "100%",
};
