/**
 * ProductReviews — Star rating form + approved reviews list
 * Used on ProductDetail pages
 */
import { useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
          style={{ background: "none", border: "none", padding: 0 }}
        >
          <Star
            size={size}
            fill={(hovered || value) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= star ? "#f59e0b" : "#555"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: reviewData, refetch } = trpc.reviews.getForProduct.useQuery({ productId });
  const { data: myReview } = trpc.reviews.myReviews.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitMutation = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setRating(0);
      setReviewText("");
      refetch();
      toast.success("Review submitted! It will appear after approval.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit review.");
    },
  });

  const reviews = reviewData?.reviews ?? [];
  const avgRating = reviewData?.avgRating ?? 0;
  const count = reviewData?.count ?? 0;

  const alreadyReviewed = myReview?.some((r) => r.productId === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters.");
      return;
    }
    submitMutation.mutate({ productId, rating, reviewText: reviewText.trim() });
  };

  return (
    <section style={{ marginTop: "4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.6rem",
            letterSpacing: "0.1em",
            color: "oklch(0.96 0 0)",
            marginBottom: "0.5rem",
          }}
        >
          CUSTOMER REVIEWS
        </div>
        {count > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <StarRating value={Math.round(avgRating)} readonly size={18} />
            <span style={{ color: "oklch(0.65 0 0)", fontSize: "0.85rem" }}>
              {avgRating.toFixed(1)} out of 5 · {count} review{count !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div
        style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            color: "oklch(0.45 0 0)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Leave a Review — Earn $1 Loyalty Credit
        </div>

        {!isAuthenticated ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Sign in to leave a review and earn loyalty rewards.
            </p>
            <a href={getLoginUrl()}>
              <Button
                style={{
                  background: "linear-gradient(135deg, #bf5fff, #8b00ff)",
                  border: "none",
                  color: "#fff",
                }}
              >
                Sign In to Review
              </Button>
            </a>
          </div>
        ) : alreadyReviewed ? (
          <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.9rem" }}>
            You've already submitted a review for this product. Thank you!
          </p>
        ) : submitted ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✓</div>
            <p style={{ color: "oklch(0.65 0 0)", fontSize: "0.9rem" }}>
              Review submitted! It will appear here once approved. You'll earn $1 in loyalty credits.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "oklch(0.55 0 0)",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                Your Rating
              </label>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "oklch(0.55 0 0)",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                Your Review
              </label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`Share your experience with ${productName}...`}
                rows={4}
                style={{
                  background: "oklch(0.04 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  color: "oklch(0.9 0 0)",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.4 0 0)",
                  marginTop: "0.25rem",
                  textAlign: "right",
                }}
              >
                {reviewText.length}/2000
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              style={{
                background: "linear-gradient(135deg, #bf5fff, #8b00ff)",
                border: "none",
                color: "#fff",
              }}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </div>

      {/* Approved Reviews List */}
      {reviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "oklch(0.06 0 0)",
                border: "1px solid oklch(1 0 0 / 6%)",
                borderRadius: "10px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "oklch(0.85 0 0)",
                      fontSize: "0.9rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {review.reviewerName ?? "Verified Customer"}
                  </div>
                  <StarRating value={review.rating} readonly size={14} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "oklch(0.4 0 0)" }}>
                  {formatDate(review.createdAt)}
                </div>
              </div>
              <p
                style={{
                  color: "oklch(0.65 0 0)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {review.reviewText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "oklch(0.4 0 0)",
            fontSize: "0.875rem",
            border: "1px dashed oklch(1 0 0 / 8%)",
            borderRadius: "10px",
          }}
        >
          No reviews yet. Be the first to share your experience.
        </div>
      )}
    </section>
  );
}
