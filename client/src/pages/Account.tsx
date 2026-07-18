/**
 * My Account — Luxurious Habbits
 * Customer portal: order history, subscription status, admin shortcut for owner.
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Package, ArrowRight, Clock, CheckCircle, Truck, XCircle, RefreshCw, Settings, Star, Gift, Heart, Camera, Upload, Loader2, CheckCircle2, MapPin, Plus, Edit2, Trash2, Share2, Copy, Check, Lock, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import SEO from "@/components/SEO";
import WalletConnectButton from "@/components/WalletConnectButton";

/** Convert a cropped area to a base64 blob */
async function getCroppedImg(imageSrc: string, pixelCrop: Area, mimeType: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return canvas.toDataURL(mimeType).split(",")[1];
}

function getTrackingUrl(carrier: string | null | undefined, trackingNumber: string): string {
  const num = encodeURIComponent(trackingNumber);
  switch ((carrier ?? "").toUpperCase()) {
    case "UPS":   return `https://www.ups.com/track?tracknum=${num}`;
    case "USPS":  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
    case "FEDEX": return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    case "DHL":   return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${num}`;
    default:      return `https://www.google.com/search?q=${num}+tracking`;
  }
}

const STATUS_STYLES: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending:    { color: "#f5a623", label: "Pending",    icon: <Clock size={12} /> },
  confirmed:  { color: "#00e5a0", label: "Confirmed",  icon: <CheckCircle size={12} /> },
  processing: { color: "#3b82f6", label: "Processing", icon: <RefreshCw size={12} /> },
  shipped:    { color: "#bf5fff", label: "Shipped",    icon: <Truck size={12} /> },
  delivered:  { color: "#00e5a0", label: "Delivered",  icon: <CheckCircle size={12} /> },
  cancelled:  { color: "oklch(0.45 0 0)", label: "Cancelled", icon: <XCircle size={12} /> },
  refunded:   { color: "oklch(0.45 0 0)", label: "Refunded",  icon: <XCircle size={12} /> },
};

function ProfilePhotoSection() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: profile } = trpc.profile.getProfile.useQuery();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMime, setCropMime] = useState<string>("image/jpeg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const uploadPhoto = trpc.profile.uploadPhoto.useMutation({
    onSuccess: () => {
      utils.profile.getProfile.invalidate();
      setUploadError("");
      setUploading(false);
      setCropSrc(null);
    },
    onError: (e) => {
      setUploadError(e.message);
      setUploading(false);
    },
  });

  const removePhoto = trpc.profile.removePhoto.useMutation({
    onSuccess: () => utils.profile.getProfile.invalidate(),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) { setUploadError("Image must be under 7MB"); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setUploadError("Only JPEG, PNG, or WebP allowed"); return; }
    setUploadError("");
    setCropMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleCropConfirm() {
    if (!cropSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const base64 = await getCroppedImg(cropSrc, croppedAreaPixels, cropMime);
      uploadPhoto.mutate({ base64, mimeType: cropMime as any });
    } catch {
      setUploadError("Failed to process image");
      setUploading(false);
    }
  }

  const photoUrl = profile?.profilePhotoKey ? `/manus-storage/${profile.profilePhotoKey}` : null;
  const displayName = profile?.nickname || profile?.name || (user as any)?.name || "You";

  return (
    <>
      {/* Crop Modal */}
      {cropSrc && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "oklch(0 0 0 / 90%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: "min(420px, 95vw)", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>CROP PHOTO</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", margin: "0.25rem 0 0" }}>Drag to reposition · Scroll or pinch to zoom</p>
            </div>
            {/* Crop area */}
            <div style={{ position: "relative", width: "100%", height: "320px", background: "oklch(0.04 0 0)" }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            {/* Zoom slider */}
            <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", borderTop: "1px solid oklch(1 0 0 / 8%)" }}>
              <ZoomOut size={15} style={{ color: "oklch(0.45 0 0)", flexShrink: 0 }} />
              <input
                type="range" min={1} max={3} step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ flex: 1, accentColor: "#bf5fff" }}
              />
              <ZoomIn size={15} style={{ color: "oklch(0.45 0 0)", flexShrink: 0 }} />
            </div>
            {/* Actions */}
            <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setCropSrc(null)}
                className="btn-outline-white"
                style={{ flex: 1, fontSize: "0.78rem" }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="btn-gold"
                style={{ flex: 1, fontSize: "0.78rem" }}
                disabled={uploading}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading ? "Uploading..." : "Save Photo"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 2rem" }}>
        <div style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div className="section-label" style={{ marginBottom: "0.4rem" }}>Profile</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>PROFILE PHOTO</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "96px", height: "96px", borderRadius: "50%",
                background: photoUrl ? "transparent" : "oklch(0.10 0 0)",
                border: "2px solid oklch(1 0 0 / 12%)",
                overflow: "hidden", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.2s",
              }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Camera size={28} style={{ color: "oklch(0.30 0 0)" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.25rem" }}>
                {displayName}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginBottom: "1rem" }}>
                {profile?.email || (user as any)?.email || ""}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-gold"
                  style={{ fontSize: "0.72rem" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Camera size={13} />
                    {photoUrl ? "Change Photo" : "Upload Photo"}
                  </span>
                </button>
                {photoUrl && (
                  <button
                    onClick={() => removePhoto.mutate()}
                    disabled={removePhoto.isPending}
                    className="btn-outline-white"
                    style={{ fontSize: "0.72rem" }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {uploadError && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#ff4444", marginTop: "0.5rem" }}>{uploadError}</div>
              )}
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginTop: "0.5rem" }}>
                JPEG, PNG, or WebP · Max 7MB · Crop to a circle after selecting
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </section>
    </>
  );
}

function NicknameSection() {
  const utils = trpc.useUtils();
  const { data: nicknameData, isLoading } = trpc.strainComments.getMyNickname.useQuery();
  const [nickname, setNickname] = useState("");
  const [saved, setSaved] = useState(false);

  const isLocked = !!nicknameData?.nickname;

  const updateNickname = trpc.strainComments.updateNickname.useMutation({
    onSuccess: () => {
      utils.strainComments.getMyNickname.invalidate();
      setSaved(true);
    },
    onError: (err) => {
      // Surface server-side lock error to user
      alert(err.message);
    },
  });

  return (
    <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
      <div style={{ background: "oklch(0.06 0 0 / 80%)", border: `1px solid ${isLocked ? "oklch(0.75 0.18 60 / 30%)" : "oklch(1 0 0 / 8%)"}`, borderRadius: "12px", padding: "2rem" }}>
        <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div className="section-label" style={{ marginBottom: "0.4rem" }}>Community</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>DISPLAY NAME</h3>
          </div>
          {isLocked && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "oklch(0.75 0.18 60 / 10%)", border: "1px solid oklch(0.75 0.18 60 / 30%)", borderRadius: "6px", padding: "0.35rem 0.7rem" }}>
              <Lock size={11} style={{ color: "oklch(0.75 0.18 60)" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.75 0.18 60)" }}>Locked</span>
            </div>
          )}
        </div>

        {isLocked ? (
          // ── LOCKED STATE ──────────────────────────────────────────
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Your display name is permanent and cannot be changed after it has been set.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "0.9rem 1.1rem" }}>
              <Lock size={14} style={{ color: "oklch(0.40 0 0)", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.06em", color: "oklch(0.96 0 0)" }}>{nicknameData.nickname}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)", marginTop: "0.15rem" }}>This name appears on all your strain review comments.</div>
              </div>
            </div>
          </div>
        ) : (
          // ── SET NAME STATE ────────────────────────────────────────
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.6, margin: 0 }}>
              Choose your display name carefully — <strong style={{ color: "oklch(0.65 0 0)" }}>it cannot be changed once set</strong>. This name will appear on all your strain review comments.
            </p>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)", display: "block", marginBottom: "0.4rem" }}>Nickname / Display Name</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder={nicknameData?.name || "Your display name"}
                maxLength={40}
                disabled={isLoading}
                style={{ width: "100%", maxWidth: "320px", background: "oklch(0.09 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.6rem 0.85rem", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.80 0 0)", outline: "none" }}
              />
            </div>
            <div>
              <button
                onClick={() => updateNickname.mutate({ nickname: nickname.trim() })}
                disabled={updateNickname.isPending || saved || nickname.trim().length < 2}
                className="btn-gold"
                style={{ fontSize: "0.72rem" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {updateNickname.isPending ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Lock size={13} />}
                  {updateNickname.isPending ? "Saving..." : saved ? "Name Locked In!" : "Lock In Display Name"}
                </span>
              </button>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>
                Once saved, this cannot be undone.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SmsNotificationsSection() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [smsOptIn, setSmsOptIn] = useState((user as any)?.smsOptIn ?? false);
  const [saved, setSaved] = useState(false);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSave = () => {
    updateProfile.mutate({ phone: phone.trim() || undefined, smsOptIn });
  };

  return (
    <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
      <div style={{
        background: "oklch(0.06 0 0 / 80%)",
        border: "1px solid oklch(1 0 0 / 8%)",
        borderRadius: "12px",
        padding: "2rem",
      }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="section-label" style={{ marginBottom: "0.4rem" }}>Notifications</div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>SMS ALERTS</h3>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Receive order confirmation and shipping updates via text message. Standard messaging rates may apply. Reply STOP at any time to unsubscribe.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)", display: "block", marginBottom: "0.4rem" }}>Mobile Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={{
                width: "100%",
                maxWidth: "320px",
                background: "oklch(0.09 0 0)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "6px",
                padding: "0.6rem 0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.82rem",
                color: "oklch(0.80 0 0)",
                outline: "none",
              }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={e => setSmsOptIn(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#bf5fff", cursor: "pointer" }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.60 0 0)", lineHeight: 1.5 }}>
              Yes, send me order confirmation and shipping SMS updates
            </span>
          </label>
          <div>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="btn-gold"
              style={{ fontSize: "0.72rem" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {updateProfile.isPending ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
                {updateProfile.isPending ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Account() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = (user as any)?.role === "admin";
  const utils = trpc.useUtils();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [gbpReviewerName, setGbpReviewerName] = useState("");
  const [gbpFile, setGbpFile] = useState<File | null>(null);
  const [gbpPreview, setGbpPreview] = useState<string | null>(null);
  const [gbpUploading, setGbpUploading] = useState(false);
  const gbpFileRef = useRef<HTMLInputElement>(null);

  const handleGbpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGbpFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setGbpPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGbpSubmit = async () => {
    if (!gbpFile || !gbpReviewerName.trim()) return;
    setGbpUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(gbpFile);
      });
      await submitGbpMutation.mutateAsync({
        reviewerName: gbpReviewerName.trim(),
        screenshotBase64: base64,
        mimeType: gbpFile.type || "image/jpeg",
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setGbpUploading(false);
    }
  };

  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: loyaltyBalance } = trpc.loyalty.getBalance.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: loyaltyBreakdown } = trpc.loyalty.getBalanceBreakdown.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Tier config
  const tierConfig: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
    standard:  { label: "STANDARD",  color: "#f5a623", next: "elevated",  nextLabel: "Elevated" },
    elevated:  { label: "ELEVATED",  color: "#bf5fff", next: "luxurious", nextLabel: "Luxurious Connoisseur" },
    luxurious: { label: "LUXURIOUS CONNOISSEUR", color: "#00e5a0" },
  };
  const currentTier = (user as any)?.loyaltyTier ?? "standard";
  const tier = tierConfig[currentTier] ?? tierConfig.standard;
  const subscriptionStreak = (user as any)?.subscriptionStreak ?? 0;

  const { data: loyaltyHistory } = trpc.loyalty.getHistory.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: wishlistData } = trpc.wishlists.getMyWishlist.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const removeFromWishlistMutation = trpc.wishlists.toggle.useMutation({
    onSuccess: () => utils.wishlists.getMyWishlist.invalidate(),
  });

  // Address book
  const { data: addressesData, isLoading: addressesLoading } = trpc.addresses.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const addAddressMutation = trpc.addresses.add.useMutation({
    onSuccess: () => { utils.addresses.list.invalidate(); setShowAddressForm(false); setEditingAddress(null); }
  });
  const updateAddressMutation = trpc.addresses.update.useMutation({
    onSuccess: () => { utils.addresses.list.invalidate(); setShowAddressForm(false); setEditingAddress(null); }
  });
  const removeAddressMutation = trpc.addresses.remove.useMutation({
    onSuccess: () => utils.addresses.list.invalidate()
  });
  const setDefaultMutation = trpc.addresses.setDefault.useMutation({
    onSuccess: () => utils.addresses.list.invalidate()
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  const { data: referralData } = trpc.referrals.getMyCode.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const referralLink = referralData?.code
    ? `${window.location.origin}/?ref=${referralData.code}`
    : "";

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addrForm, setAddrForm] = useState({ label: "Home", firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", zip: "", phone: "", isDefault: false });

  const openAddressForm = (addr?: any) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrForm({ label: addr.label, firstName: addr.firstName, lastName: addr.lastName, address1: addr.address1, address2: addr.address2 ?? "", city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone ?? "", isDefault: addr.isDefault });
    } else {
      setEditingAddress(null);
      setAddrForm({ label: "Home", firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", zip: "", phone: "", isDefault: false });
    }
    setShowAddressForm(true);
  };

  const submitAddressForm = () => {
    const payload = { ...addrForm, address2: addrForm.address2 || undefined, phone: addrForm.phone || undefined };
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, ...payload });
    } else {
      addAddressMutation.mutate(payload);
    }
  };

  const { data: gbpSubmissions } = trpc.gbpReviews.getMySubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const submitGbpMutation = trpc.gbpReviews.submit.useMutation({
    onSuccess: () => {
      utils.gbpReviews.getMySubmissions.invalidate();
      setGbpReviewerName("");
      setGbpFile(null);
      setGbpPreview(null);
    },
  });

  // Not logged in — redirect to login
  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)" }}>
          LOADING...
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders ?? [];

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <SEO title="My Account" description="View your orders, subscription, and account details." canonical="/account" noIndex />

      {/* ── HEADER ── */}
      <section style={{ padding: "8rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "0.75rem" }}>Account</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2.5rem, 7vw, 4rem)",
                letterSpacing: "0.05em",
                color: "oklch(0.96 0 0)",
                lineHeight: 1.0,
                marginBottom: "0.25rem",
              }}>
                {user?.name ? `WELCOME BACK,` : "MY ACCOUNT"}
              </h1>
              {user?.name && (
                <h1 className="text-holo" style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2.5rem, 7vw, 4rem)",
                  letterSpacing: "0.05em",
                  lineHeight: 1.0,
                }}>
                  {user.name.toUpperCase()}.
                </h1>
              )}
            </div>
            {isAdmin && (
              <Link href="/admin">
                <button className="btn-gold" style={{ fontSize: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Settings size={13} /> Admin Panel
                  </span>
                </button>
              </Link>
            )}
          </div>

          {/* Account info bar */}
          <div style={{
            marginTop: "2rem",
            padding: "1rem 1.5rem",
            background: "oklch(0.06 0 0 / 80%)",
            border: "1px solid oklch(1 0 0 / 8%)",
            borderRadius: "8px",
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.2rem" }}>Email</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.70 0 0)" }}>{user?.email ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.2rem" }}>Member Since</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.70 0 0)" }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—"}
              </div>
            </div>
            {isAdmin && (
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.2rem" }}>Role</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "#bf5fff", fontWeight: 600 }}>Admin</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PROFILE PHOTO & DISPLAY NAME ── */}
      <ProfilePhotoSection />
      <NicknameSection />
      {/* ── QUICK LINKS ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { label: "My Subscription", desc: "Manage your Habbits Box", href: "/my-subscription", color: "#bf5fff" },
              { label: "Shop Products", desc: "Browse premium THCA flower", href: "/products", color: "#f5a623" },
              { label: "The Habbits Box", desc: "Explore subscription tiers", href: "/habbits-box", color: "#00e5a0" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div style={{
                  background: "oklch(0.06 0 0 / 80%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  cursor: "pointer",
                  transition: "border-color 150ms ease",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = item.color + "55"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 8%)"}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.2rem" }}>{item.label}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)" }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOYALTY POINTS ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>Rewards</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              LOYALTY POINTS
            </h2>
          </div>

          {/* Tier badge + balance card */}
          <div style={{
            background: "linear-gradient(135deg, oklch(0.06 0 0), oklch(0.09 0 0))",
            border: `1px solid ${tier.color}40`,
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "1.5rem",
          }}>
            {/* Top row: tier badge + total balance */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${tier.color}20`, border: `1px solid ${tier.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Star size={22} style={{ color: tier.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: tier.color, marginBottom: "0.15rem" }}>
                    {tier.label} MEMBER
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", color: tier.color, lineHeight: 1 }}>
                    {loyaltyBalance?.points ?? 0}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>
                    Total Points
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", letterSpacing: "0.05em", color: "#f5a623", lineHeight: 1 }}>
                  ${loyaltyBalance?.dollarValue ?? 0}.00
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>
                  Redeemable Value
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginTop: "0.25rem" }}>
                  Max ${loyaltyBreakdown?.maxLoyaltyDiscount ?? 100} loyalty + ${loyaltyBreakdown?.maxReviewDiscount ?? 100} review credits per order
                </div>
              </div>
            </div>

            {/* Balance breakdown: loyalty pts vs review credits */}
            {loyaltyBreakdown && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "oklch(0.04 0 0 / 60%)", border: "1px solid #f5a62330", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#f5a623", lineHeight: 1 }}>
                    {loyaltyBreakdown.loyaltyPoints} pts
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", marginTop: "0.2rem" }}>Purchase Points</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginTop: "0.15rem" }}>Capped at ${loyaltyBreakdown.maxLoyaltyDiscount}/order</div>
                </div>
                <div style={{ background: "oklch(0.04 0 0 / 60%)", border: "1px solid #bf5fff30", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#bf5fff", lineHeight: 1 }}>
                    {loyaltyBreakdown.reviewCredits} pts
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", marginTop: "0.2rem" }}>Review Credits</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginTop: "0.15rem" }}>Capped at ${loyaltyBreakdown.maxReviewDiscount}/order</div>
                </div>
              </div>
            )}

            {/* Tier info blocks */}
            {currentTier === "standard" && (
              <div style={{ background: "oklch(0.04 0 0 / 60%)", border: "1px solid #bf5fff30", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "#bf5fff", marginBottom: "0.35rem" }}>ELEVATED TIER REQUIRED FOR SUBSCRIPTION BOX</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", lineHeight: 1.6 }}>
                  Elevated tier unlocks the Habbits Box &amp; Stoner Box subscription and gives you <strong style={{ color: "oklch(0.65 0 0)" }}>1.5x points</strong> on every purchase. Contact us to get upgraded.
                </div>
              </div>
            )}
            {currentTier === "elevated" && (
              <div style={{ background: "oklch(0.04 0 0 / 60%)", border: "1px solid #bf5fff40", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "oklch(0.75 0 0)" }}>
                    Luxurious Connoisseur Tier Progress
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "#00e5a0" }}>
                    {subscriptionStreak}/3 CONSECUTIVE BOX ORDERS
                  </div>
                </div>
                <div style={{ height: "6px", background: "oklch(0.12 0 0)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (subscriptionStreak / 3) * 100)}%`, background: "linear-gradient(90deg, #bf5fff, #00e5a0)", borderRadius: "3px", transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginTop: "0.4rem" }}>
                  You earn <strong style={{ color: "oklch(0.55 0 0)" }}>1.5x points</strong> on every purchase. Subscribe to the Habbits Box or Stoner Box for 3 consecutive orders to unlock Luxurious Connoisseur tier — 2x points.
                </div>
              </div>
            )}
            {currentTier === "luxurious" && (
              <div style={{ background: "oklch(0.04 0 0 / 60%)", border: "1px solid #00e5a040", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "#00e5a0" }}>LUXURIOUS CONNOISSEUR TIER UNLOCKED</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", marginTop: "0.25rem" }}>You earn 2x points on every purchase. Keep your streak going to maintain your status.</div>
              </div>
            )}
          </div>

          {/* How to earn */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { icon: <Package size={14} />, title: "Shop", desc: "Earn 1 pt per $1 spent", color: "#f5a623" },
              { icon: <Star size={14} />, title: "Review", desc: "Earn 100 pts per approved review", color: "#bf5fff" },
              { icon: <Gift size={14} />, title: "Subscribe", desc: "Double points on Habbit Box orders", color: "#00e5a0" },
            ].map(item => (
              <div key={item.title} style={{
                background: "oklch(0.06 0 0 / 80%)",
                border: "1px solid oklch(1 0 0 / 8%)",
                borderRadius: "8px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.80 0 0)", marginBottom: "0.1rem" }}>{item.title}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Point history */}
          {loyaltyHistory && loyaltyHistory.length > 0 && (
            <div style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.08em", color: "oklch(0.70 0 0)" }}>POINT HISTORY</div>
              </div>
              {loyaltyHistory.slice(0, 10).map((entry: any) => (
                <div key={entry.id} style={{
                  padding: "0.85rem 1.5rem",
                  borderBottom: "1px solid oklch(1 0 0 / 4%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.75 0 0)" }}>
                      {entry.note ?? entry.reason.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)", marginTop: "0.15rem" }}>
                      {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.1rem",
                    letterSpacing: "0.05em",
                    color: entry.points > 0 ? "#00e5a0" : "#ff4444",
                  }}>
                    {entry.points > 0 ? "+" : ""}{entry.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MY WISHLIST ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>Saved</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              MY WISHLIST
            </h2>
          </div>

          {!wishlistData || wishlistData.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px" }}>
              <Heart size={32} style={{ color: "oklch(0.25 0 0)", margin: "0 auto 1rem" }} />
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.40 0 0)", marginBottom: "1rem" }}>No saved products yet.</div>
              <Link href="/products">
                <button className="btn-gold" style={{ fontSize: "0.72rem" }}><span>Browse Products</span></button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {wishlistData.map((item: any) => (
                <div key={item.productId} style={{
                  background: "oklch(0.06 0 0 / 80%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Product image */}
                  <div style={{ height: "140px", background: "oklch(0.08 0 0)", overflow: "hidden", position: "relative" }}>
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={28} style={{ color: "oklch(0.25 0 0)" }} />
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlistMutation.mutate({ productId: item.productId })}
                      style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "oklch(0 0 0 / 60%)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Heart size={13} fill="#ff4444" color="#ff4444" />
                    </button>
                  </div>
                  {/* Info */}
                  <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
                      {item.product?.name ?? "Product"}
                    </div>
                    {item.product?.retailPrice && (
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "#f5a623" }}>
                        ${parseFloat(item.product.retailPrice).toFixed(2)}
                      </div>
                    )}
                    <Link href={`/products/${item.product?.slug ?? ""}`} style={{ marginTop: "auto" }}>
                      <button className="btn-gold" style={{ width: "100%", fontSize: "0.68rem", padding: "0.5rem" }}>
                        <span>View Product</span>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GOOGLE REVIEW CREDIT ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>Earn Rewards</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              GOOGLE REVIEW CREDIT
            </h2>
          </div>

          {gbpSubmissions && gbpSubmissions.some((s: any) => s.status === "approved") ? (
            <div style={{ padding: "2rem", background: "oklch(0.06 0 0 / 80%)", border: "1px solid #00e5a040", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
              <CheckCircle2 size={28} style={{ color: "#00e5a0", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.2rem" }}>Credit Received</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.50 0 0)" }}>Your Google review has been verified. 100 loyalty points ($1) have been added to your account.</div>
              </div>
            </div>
          ) : gbpSubmissions && gbpSubmissions.some((s: any) => s.status === "pending") ? (
            <div style={{ padding: "2rem", background: "oklch(0.06 0 0 / 80%)", border: "1px solid #f5a62340", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
              <Clock size={28} style={{ color: "#f5a623", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.2rem" }}>Under Review</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.50 0 0)" }}>Your screenshot has been submitted. We'll verify it within 24 hours and add your 100 points.</div>
              </div>
            </div>
          ) : (
            <div style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
              {/* Explainer */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "oklch(0.04 0 0)", borderRadius: "8px", border: "1px solid #bf5fff22" }}>
                <Camera size={20} style={{ color: "#bf5fff", flexShrink: 0, marginTop: "0.1rem" }} />
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.3rem" }}>Earn 100 Points ($1 Off)</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)", lineHeight: 1.6 }}>
                    Leave us a review on Google, take a screenshot, and upload it here. Once verified, we'll add 100 loyalty points to your account — redeemable as $1 off your next order.
                  </div>
                  <a href="https://g.page/r/luxurioushabbits/review" target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: "0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#bf5fff", textDecoration: "underline" }}>
                    Leave a Google Review →
                  </a>
                </div>
              </div>

              {/* Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", display: "block", marginBottom: "0.4rem" }}>Your Name on Google</label>
                  <input
                    value={gbpReviewerName}
                    onChange={e => setGbpReviewerName(e.target.value)}
                    placeholder="e.g. John D."
                    style={{ width: "100%", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "6px", padding: "0.65rem 0.85rem", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.85 0 0)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", display: "block", marginBottom: "0.4rem" }}>Screenshot of Your Review</label>
                  <div
                    onClick={() => gbpFileRef.current?.click()}
                    style={{
                      border: `2px dashed ${gbpPreview ? "#bf5fff66" : "oklch(1 0 0 / 12%)"}`,
                      borderRadius: "8px",
                      padding: "1.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: gbpPreview ? "oklch(0.05 0 0)" : "transparent",
                      transition: "border-color 150ms ease",
                    }}
                  >
                    {gbpPreview ? (
                      <img src={gbpPreview} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "4px", objectFit: "contain" }} />
                    ) : (
                      <div>
                        <Upload size={24} style={{ color: "oklch(0.30 0 0)", margin: "0 auto 0.5rem" }} />
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>Click to upload screenshot</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.28 0 0)", marginTop: "0.25rem" }}>JPG, PNG · Max 10MB</div>
                      </div>
                    )}
                  </div>
                  <input ref={gbpFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleGbpFileChange} />
                </div>

                {submitGbpMutation.error && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#ff4444", padding: "0.75rem", background: "#ff444410", borderRadius: "6px", border: "1px solid #ff444430" }}>
                    {submitGbpMutation.error.message}
                  </div>
                )}

                <button
                  onClick={handleGbpSubmit}
                  disabled={!gbpFile || !gbpReviewerName.trim() || gbpUploading}
                  className="btn-gold"
                  style={{ opacity: (!gbpFile || !gbpReviewerName.trim() || gbpUploading) ? 0.5 : 1, cursor: (!gbpFile || !gbpReviewerName.trim() || gbpUploading) ? "not-allowed" : "pointer" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {gbpUploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                    {gbpUploading ? "Submitting..." : "Submit for Review"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── ADDRESS BOOK ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-label" style={{ marginBottom: "0.5rem" }}>Shipping</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>ADDRESS BOOK</h2>
            </div>
            <button className="btn-outline-white" style={{ fontSize: "0.72rem" }} onClick={() => openAddressForm()}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Plus size={13} /> Add Address</span>
            </button>
          </div>

          {/* Address form */}
          {showAddressForm && (
            <div style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid #bf5fff40", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "1.25rem" }}>
                {editingAddress ? "EDIT ADDRESS" : "NEW ADDRESS"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  { key: "label", label: "Label", placeholder: "Home / Work / Other" },
                  { key: "firstName", label: "First Name", placeholder: "John" },
                  { key: "lastName", label: "Last Name", placeholder: "Doe" },
                  { key: "address1", label: "Address Line 1", placeholder: "123 Main St" },
                  { key: "address2", label: "Address Line 2", placeholder: "Apt 4B (optional)" },
                  { key: "city", label: "City", placeholder: "Charlotte" },
                  { key: "state", label: "State", placeholder: "NC" },
                  { key: "zip", label: "ZIP Code", placeholder: "28201" },
                  { key: "phone", label: "Phone (optional)", placeholder: "+1 (555) 000-0000" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", display: "block", marginBottom: "0.3rem" }}>{f.label}</label>
                    <input
                      value={(addrForm as any)[f.key]}
                      onChange={e => setAddrForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: "100%", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "6px", padding: "0.6rem 0.8rem", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.85 0 0)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
                <input type="checkbox" id="addrDefault" checked={addrForm.isDefault} onChange={e => setAddrForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
                <label htmlFor="addrDefault" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.55 0 0)", cursor: "pointer" }}>Set as default shipping address</label>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button
                  className="btn-gold"
                  style={{ fontSize: "0.72rem", opacity: (addAddressMutation.isPending || updateAddressMutation.isPending) ? 0.6 : 1 }}
                  onClick={submitAddressForm}
                  disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                >
                  <span>{editingAddress ? "Save Changes" : "Save Address"}</span>
                </button>
                <button className="btn-outline-white" style={{ fontSize: "0.72rem" }} onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {addressesLoading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>Loading addresses...</div>
          ) : !addressesData || addressesData.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px" }}>
              <MapPin size={32} style={{ color: "oklch(0.25 0 0)", margin: "0 auto 1rem" }} />
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.40 0 0)" }}>No saved addresses yet. Add one to speed up checkout.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {addressesData.map((addr: any) => (
                <div key={addr.id} style={{ background: "oklch(0.06 0 0 / 80%)", border: `1px solid ${addr.isDefault ? "#bf5fff55" : "oklch(1 0 0 / 8%)"}`, borderRadius: "10px", padding: "1.25rem", position: "relative" }}>
                  {addr.isDefault && (
                    <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "#bf5fff22", border: "1px solid #bf5fff55", borderRadius: "4px", padding: "0.2rem 0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#bf5fff" }}>Default</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <MapPin size={14} style={{ color: "#bf5fff" }} />
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>{addr.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.65 0 0)", lineHeight: 1.6 }}>
                    <div>{addr.firstName} {addr.lastName}</div>
                    <div>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}</div>
                    <div>{addr.city}, {addr.state} {addr.zip}</div>
                    {addr.phone && <div>{addr.phone}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    {!addr.isDefault && (
                      <button onClick={() => setDefaultMutation.mutate({ id: addr.id })} style={{ flex: 1, background: "oklch(0.09 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "5px", padding: "0.45rem", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.55 0 0)", cursor: "pointer" }}>Set Default</button>
                    )}
                    <button onClick={() => openAddressForm(addr)} style={{ flex: 1, background: "oklch(0.09 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "5px", padding: "0.45rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.55 0 0)", cursor: "pointer" }}><Edit2 size={11} /> Edit</button>
                    <button onClick={() => removeAddressMutation.mutate({ id: addr.id })} style={{ background: "oklch(0.09 0 0)", border: "1px solid #ff444430", borderRadius: "5px", padding: "0.45rem 0.6rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={11} color="#ff4444" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ORDER HISTORY ── */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>History</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              MY ORDERS
            </h2>
          </div>

          {ordersLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem" }}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              padding: "3rem",
              background: "oklch(0.06 0 0 / 80%)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "8px",
              textAlign: "center",
            }}>
              <Package size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.25rem", letterSpacing: "0.05em", color: "oklch(0.50 0 0)", marginBottom: "0.5rem" }}>
                NO ORDERS YET
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.35 0 0)", marginBottom: "1.5rem" }}>
                Your order history will appear here after your first purchase.
              </p>
              <Link href="/products">
                <button className="btn-gold" style={{ fontSize: "0.75rem" }}><span>Shop Now</span></button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((order: any) => {
                const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
                return (
                  <div key={order.id} style={{
                    background: "oklch(0.06 0 0 / 80%)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}>
                    {/* Status bar */}
                    <div style={{ height: "2px", background: status.color, opacity: 0.7 }} />
                    <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.2rem" }}>
                          Order #{order.orderNumber}
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                        {/* Status badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: status.color, fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 500 }}>
                          {status.icon} {status.label}
                        </div>
                        {/* Total */}
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: "#f5a623" }}>
                          ${parseFloat(order.total).toFixed(2)}
                        </div>
                        {/* Tracking */}
                        {order.trackingNumber && (
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)" }}>
                            {order.trackingCarrier && (
                              <span style={{ color: "oklch(0.55 0 0)", marginRight: "0.3rem" }}>{order.trackingCarrier}:</span>
                            )}
                            <a
                              href={getTrackingUrl(order.trackingCarrier, order.trackingNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#00e5a0", textDecoration: "underline", cursor: "pointer" }}
                            >
                              {order.trackingNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── REFERRAL PROGRAM ── */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div style={{
          background: "oklch(0.06 0 0 / 80%)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, #d4af37, #bf5fff)" }} />
          <div style={{ padding: "2rem 2rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Share2 size={18} style={{ color: "#d4af37" }} />
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", margin: 0 }}>REFERRAL PROGRAM</h2>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "oklch(0.55 0 0)", margin: "0 0 1.5rem" }}>
              Share your link. When a friend places their first order, you earn 500 points ($5 credit).
            </p>

            {/* Stats row */}
            {referralData && (
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                {[
                  { label: "Total Referrals", value: referralData.totalReferrals },
                  { label: "Converted", value: referralData.converted },
                  { label: "Site Credit Earned", value: `$${((referralData.totalEarnedCents ?? 0) / 100).toFixed(2)}` },
                ].map(s => (
                  <div key={s.label} style={{
                    flex: "1 1 120px",
                    background: "oklch(0.09 0 0)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                    borderRadius: "8px",
                    padding: "1rem",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.05em", color: "#d4af37" }}>{s.value}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginTop: "0.2rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Link box */}
            {referralLink && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
                <div style={{
                  flex: 1,
                  background: "oklch(0.09 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "6px",
                  padding: "0.7rem 1rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.78rem",
                  color: "oklch(0.65 0 0)",
                  wordBreak: "break-all",
                  minWidth: 0,
                }}>
                  {referralLink}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="btn-gold"
                  style={{ fontSize: "0.72rem", minWidth: "110px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {referralCopied ? <Check size={13} /> : <Copy size={13} />}
                    {referralCopied ? "Copied!" : "Copy Link"}
                  </span>
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I shop at Luxurious Habbits — premium hemp. Use my link for the best experience: ${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-white"
                  style={{ fontSize: "0.72rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem" }}
                >
                  <Share2 size={13} /> Share
                </a>
              </div>
            )}

            {!referralData && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.40 0 0)" }}>Loading your referral code...</div>
            )}
          </div>
        </div>
      </section>

      {/* Profile sections moved to top */}
      <SmsNotificationsSection />

      {/* ── WALLET ── */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>
        <div style={{
          background: "oklch(0.06 0 0 / 80%)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px",
          padding: "2rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <div className="section-label" style={{ marginBottom: "0.4rem" }}>Web3</div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>WALLET</h3>
            </div>
            <WalletConnectButton mode="link" />
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.6, margin: 0 }}>
            Link a Web3 wallet to your account for an alternative login method. Once linked, you can sign in with MetaMask, WalletConnect, or any compatible wallet — no email required.
          </p>
        </div>
      </section>
    </div>
  );
}
