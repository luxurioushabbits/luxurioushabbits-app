/**
 * RecentlyViewedRow — horizontal scrollable row of recently viewed products.
 * Reads from localStorage via useRecentlyViewed hook.
 * Accepts an optional `excludeSlug` to hide the current product.
 */
import { Link } from "wouter";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getStrainColors } from "@/data/strainColors";

interface Props {
  excludeSlug?: string;
}

export default function RecentlyViewedRow({ excludeSlug }: Props) {
  const { items } = useRecentlyViewed();
  const visible = items.filter(i => i.slug !== excludeSlug);

  if (visible.length === 0) return null;

  return (
    <div style={{ marginTop: "3rem" }}>
      {/* Section header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.1rem",
          letterSpacing: "0.12em",
          color: "oklch(0.96 0 0)",
        }}>
          RECENTLY VIEWED
        </div>
        <div style={{ flex: 1, height: "1px", background: "oklch(1 0 0 / 8%)" }} />
      </div>

      {/* Horizontal scroll row */}
      <div style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        scrollbarWidth: "none",
      }}>
        {visible.map(item => {
          const strainColor = getStrainColors(
            (item.strainType as "indica" | "sativa" | "hybrid") ?? "hybrid"
          ).primary;
          const price = item.retailPrice ? parseFloat(item.retailPrice) : null;

          return (
            <Link key={item.slug} href={`/products/${item.slug}`}>
              <div style={{
                flexShrink: 0,
                width: "160px",
                background: "oklch(0.07 0 0)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 180ms ease, transform 180ms ease",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = strainColor + "55";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 10%)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {/* Image */}
                <div style={{
                  width: "100%",
                  height: "120px",
                  background: "oklch(0.05 0 0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    />
                  ) : (
                    <div style={{ fontSize: "2rem", opacity: 0.15 }}>🌿</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "0.75rem" }}>
                  {item.strainType && (
                    <div style={{
                      display: "inline-block",
                      background: strainColor + "22",
                      color: strainColor,
                      border: `1px solid ${strainColor}44`,
                      borderRadius: "4px",
                      padding: "0.1rem 0.4rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}>
                      {item.strainType}
                    </div>
                  )}
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "oklch(0.85 0 0)",
                    lineHeight: 1.3,
                    marginBottom: "0.3rem",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {item.name}
                  </div>
                  {price !== null && (
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "0.9rem",
                      letterSpacing: "0.06em",
                      color: "#d4af37",
                    }}>
                      ${price.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
