import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Camera, X, MessageSquare, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StrainReviewCommentsProps {
  slug: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5" style={{ cursor: readonly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={readonly ? 14 : 22}
          fill={(readonly ? n <= value : n <= (hovered || value)) ? "#f59e0b" : "none"}
          stroke={(readonly ? n <= value : n <= (hovered || value)) ? "#f59e0b" : "oklch(0.45 0 0)"}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(n)}
          style={{ transition: "fill 0.1s, stroke 0.1s" }}
        />
      ))}
    </div>
  );
}

export default function StrainReviewComments({ slug }: StrainReviewCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: comments = [], isLoading } = trpc.strainComments.getBySlug.useQuery({ slug });
  const { data: nicknameData } = trpc.strainComments.getMyNickname.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitMutation = trpc.strainComments.submit.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setRating(0);
      setBody("");
      setPhotoDataUrl(null);
      setPhotoPreview(null);
      utils.strainComments.getBySlug.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayName = nicknameData?.nickname || nicknameData?.name || user?.name || "You";

  const avgRating = comments.length
    ? comments.reduce((s, c) => s + c.rating, 0) / comments.length
    : 0;

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Photo must be under 8 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoDataUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (rating === 0) { toast.error("Please select a star rating"); return; }
    if (body.trim().length < 10) { toast.error("Comment must be at least 10 characters"); return; }
    submitMutation.mutate({ slug, rating, body: body.trim(), photoDataUrl: photoDataUrl ?? undefined });
  }

  return (
    <section style={{ marginTop: "4rem", borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-label" style={{ marginBottom: "0.75rem" }}>Community</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          WHAT DO YOU THINK?
        </h2>
        {comments.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <StarRating value={Math.round(avgRating)} readonly />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.55 0 0)" }}>
              {avgRating.toFixed(1)} · {comments.length} {comments.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* Submit form or login prompt */}
      {isAuthenticated ? (
        <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #bf5fff, #00f5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.04 0 0)", flexShrink: 0 }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.80 0 0)", fontWeight: 600 }}>{displayName}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>Posting as — change in Account Settings</div>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.55 0 0)", marginBottom: "0.4rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Your Rating</div>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience — effects, flavor, aroma, how you consumed it…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{ background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.90 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", resize: "vertical", marginBottom: "1rem" }}
          />
          <div style={{ marginBottom: "1rem" }}>
            {photoPreview ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={photoPreview} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid oklch(1 0 0 / 15%)" }} />
                <button onClick={() => { setPhotoDataUrl(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ position: "absolute", top: "-8px", right: "-8px", width: "22px", height: "22px", borderRadius: "50%", background: "oklch(0.25 0 0)", border: "1px solid oklch(1 0 0 / 20%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "oklch(0.80 0 0)" }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "oklch(0.10 0 0)", border: "1px dashed oklch(1 0 0 / 20%)", borderRadius: "8px", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>
                <Camera size={16} /> Add a photo (optional, max 8 MB)
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          </div>
          <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-gold" style={{ minWidth: "160px" }}>
            {submitMutation.isPending ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      ) : (
        <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "2rem", textAlign: "center", marginBottom: "2.5rem" }}>
          <MessageSquare size={32} style={{ color: "oklch(0.40 0 0)", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", color: "oklch(0.65 0 0)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
            Sign in to your Luxurious Habbits account to leave a review.
          </p>
          <a href={getLoginUrl()}>
            <Button className="btn-gold" style={{ gap: "0.5rem" }}>
              <LogIn size={16} /> Sign In to Review
            </Button>
          </a>
        </div>
      )}

      {/* Approved comments */}
      {isLoading ? (
        <div style={{ color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>Loading reviews…</div>
      ) : comments.length === 0 ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontStyle: "italic" }}>
          No reviews yet — be the first to share your experience.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: "oklch(0.065 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #bf5fff44, #00f5ff44)", border: "1px solid oklch(1 0 0 / 15%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "oklch(0.80 0 0)", flexShrink: 0 }}>
                  {c.userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "oklch(0.85 0 0)" }}>{c.userName}</span>
                    <StarRating value={c.rating} readonly />
                    {c.verifiedPurchase && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.15rem 0.5rem", background: "oklch(0.20 0.08 145)", border: "1px solid oklch(0.45 0.15 145)", borderRadius: "20px", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, color: "oklch(0.75 0.18 145)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        <ShieldCheck size={10} /> Verified Purchaser
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "oklch(0.72 0 0)", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              {c.photoUrl && (
                <img src={c.photoUrl} alt="User submitted bud photo" style={{ marginTop: "0.75rem", maxWidth: "200px", borderRadius: "8px", border: "1px solid oklch(1 0 0 / 12%)" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
