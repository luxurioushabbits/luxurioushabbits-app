/**
 * Email Service — Resend-powered transactional emails
 * All emails sent from support@luxurioushabbits.com
 * Brand: Dark luxury — black bg, purple/cyan accents, Bebas Neue headings, swirl header
 */
import { Resend } from "resend";

const FROM = "Luxurious Habbits <support@luxurioushabbits.com>";
const SITE = "https://www.luxurioushabbits.com";

// Asset URLs — served via manus-storage proxy, redirect to signed CDN at open time
const LOGO_URL = `${SITE}/manus-storage/logo_skull_transparent_ad0d5e8b.png`;
const SWIRL_URL = `${SITE}/manus-storage/optical_illusion_549ade92.webp`;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

// ─── Shared Brand Template ─────────────────────────────────────────────────
// Email clients don't support CSS animations, so we simulate the glitch/luxury
// aesthetic with static layered styling, gradient borders, and the swirl header image.
function brandedEmail(opts: {
  preheader?: string;
  badge?: string;
  badgeColor?: string; // e.g. "#bf5fff" | "#00f5ff" | "#22c55e"
  headline: string;
  headlineAccent?: string; // second word/phrase in accent color
  body: string;
  cta?: { label: string; url: string; gold?: boolean };
  extraContent?: string;
  footerNote?: string;
}): string {
  const badge = opts.badge
    ? `<div style="display:inline-block;background:${opts.badgeColor ?? "#bf5fff"}22;border:1px solid ${opts.badgeColor ?? "#bf5fff"}55;border-radius:20px;padding:5px 16px;font-size:10px;letter-spacing:0.2em;color:${opts.badgeColor ?? "#bf5fff"};text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:16px;">${opts.badge}</div>`
    : "";

  const headlineParts = opts.headlineAccent
    ? `${opts.headline} <span style="color:#bf5fff;">${opts.headlineAccent}</span>`
    : opts.headline;

  const cta = opts.cta
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${opts.cta.url}" style="display:inline-block;background:${opts.cta.gold ? "linear-gradient(135deg,#d4af37,#b8962e)" : "linear-gradient(135deg,#bf5fff,#7b00e0)"};color:${opts.cta.gold ? "#000" : "#fff"};text-decoration:none;padding:14px 40px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">${opts.cta.label}</a>
      </div>`
    : "";

  const footerNote = opts.footerNote
    ? `<p style="font-size:11px;color:#444;line-height:1.7;margin:16px 0 0;text-align:center;font-family:Arial,sans-serif;">${opts.footerNote}</p>`
    : "";

  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${opts.preheader}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Luxurious Habbits</title>
</head>
<body style="margin:0;padding:0;background-color:#060606;font-family:Arial,Helvetica,sans-serif;color:#d0d0d0;">
  ${preheader}

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#060606;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#0e0e0e;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;">

          <!-- ── HEADER: Swirl + Logo ── -->
          <tr>
            <td style="padding:0;position:relative;">
              <!-- Swirl background image -->
              <div style="background-image:url('${SWIRL_URL}');background-size:cover;background-position:center;height:160px;position:relative;overflow:hidden;">
                <!-- Dark overlay -->
                <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.82) 100%);"></div>
                <!-- Corner marks TL -->
                <div style="position:absolute;top:14px;left:14px;width:20px;height:20px;border-top:1px solid #bf5fff88;border-left:1px solid #bf5fff88;"></div>
                <!-- Corner marks TR -->
                <div style="position:absolute;top:14px;right:14px;width:20px;height:20px;border-top:1px solid #bf5fff88;border-right:1px solid #bf5fff88;"></div>
                <!-- Corner marks BL -->
                <div style="position:absolute;bottom:14px;left:14px;width:20px;height:20px;border-bottom:1px solid #bf5fff88;border-left:1px solid #bf5fff88;"></div>
                <!-- Corner marks BR -->
                <div style="position:absolute;bottom:14px;right:14px;width:20px;height:20px;border-bottom:1px solid #bf5fff88;border-right:1px solid #bf5fff88;"></div>
                <!-- Logo + wordmark centered -->
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                  <img src="${LOGO_URL}" alt="Luxurious Habbits" width="52" height="52" style="width:52px;height:52px;object-fit:contain;margin-bottom:10px;filter:drop-shadow(0 0 12px #bf5fff88);" />
                  <div style="font-size:10px;letter-spacing:0.3em;color:#888;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:4px;">Premium Hemp</div>
                  <!-- Glitch-style wordmark: layered text with offset shadows -->
                  <div style="font-size:22px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;font-family:Arial,Helvetica,sans-serif;text-shadow:2px 0 0 #bf5fff55,-2px 0 0 #00f5ff33,0 0 20px #bf5fff44;">LUXURIOUS HABBITS</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Gradient border line under header -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,transparent,#bf5fff,#00f5ff,#bf5fff,transparent);padding:0;"></td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <div style="text-align:center;margin-bottom:24px;">
                ${badge}
                <div style="font-size:26px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;font-family:Arial,Helvetica,sans-serif;line-height:1.1;margin-bottom:12px;text-shadow:1px 0 0 #bf5fff33,-1px 0 0 #00f5ff22;">${headlineParts}</div>
              </div>
              ${opts.body}
              ${cta}
              ${opts.extraContent ?? ""}
              ${footerNote}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding:0;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#1e1e1e,transparent);"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="font-size:10px;color:#333;margin:0;letter-spacing:0.05em;font-family:Arial,sans-serif;">
                © ${new Date().getFullYear()} Luxurious Habbits &nbsp;·&nbsp;
                <a href="${SITE}" style="color:#444;text-decoration:none;">luxurioushabbits.com</a>
                &nbsp;·&nbsp;
                <a href="${SITE}/privacy-policy" style="color:#444;text-decoration:none;">Privacy</a>
                &nbsp;·&nbsp;
                <a href="${SITE}/terms-of-service" style="color:#444;text-decoration:none;">Terms</a>
              </p>
              <p style="font-size:9px;color:#2a2a2a;margin:8px 0 0;font-family:Arial,sans-serif;">All products contain &lt;0.3% Delta-9 THC. Farm Bill compliant. 21+ only.</p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Shared UI blocks ──────────────────────────────────────────────────────
function dataBox(rows: { label: string; value: string; accent?: boolean }[]): string {
  const rowHtml = rows.map(r => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#888;font-family:Arial,sans-serif;vertical-align:top;">${r.label}</td>
      <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:${r.accent ? "#bf5fff" : "#ccc"};font-weight:${r.accent ? "700" : "400"};font-family:Arial,sans-serif;text-align:right;vertical-align:top;">${r.value}</td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <tr><td colspan="2" style="padding-bottom:12px;"><div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;">Details</div></td></tr>
    ${rowHtml}
  </table>`;
}

function itemsTable(items: { name: string; quantity: number; price: string }[], total: string): string {
  const rows = items.map(i => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#ccc;font-family:Arial,sans-serif;">${i.name} <span style="color:#444;">×${i.quantity}</span></td>
      <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#ccc;font-family:Arial,sans-serif;text-align:right;">$${i.price}</td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <tr><td colspan="2" style="padding-bottom:12px;"><div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;">Order Items</div></td></tr>
    ${rows}
    <tr>
      <td style="padding:12px 0 0;font-size:13px;font-weight:700;color:#fff;font-family:Arial,sans-serif;">Total</td>
      <td style="padding:12px 0 0;font-size:13px;font-weight:700;color:#bf5fff;font-family:Arial,sans-serif;text-align:right;">$${total}</td>
    </tr>
  </table>`;
}

function bodyText(text: string): string {
  return `<p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 20px;text-align:center;font-family:Arial,sans-serif;">${text}</p>`;
}

// ─── Order Confirmation ────────────────────────────────────────────────────
export async function sendOrderConfirmation(opts: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: string; coaUrl?: string | null }[];
  total: string;
  shippingAddress: { address1: string; city: string; state: string; zip: string };
}) {
  const resend = getResend();

  // Build COA lab results section — only for items that have a Badger Labs COA URL
  const coaItems = opts.items.filter(i => i.coaUrl);
  const coaSection = coaItems.length > 0
    ? `<div style="margin:0 0 24px;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:16px 20px;">
        <div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:12px;">Lab Results · Third-Party Verified</div>
        <p style="font-size:12px;color:#888;line-height:1.6;margin:0 0 14px;font-family:Arial,sans-serif;">Every product is independently tested by Badger Labs. Click below to view the full Certificate of Analysis for your order.</p>
        ${coaItems.map(i => `<div style="margin-bottom:8px;">
          <a href="${i.coaUrl}" style="display:inline-block;background:transparent;border:1px solid #00f5ff44;color:#00f5ff;text-decoration:none;padding:8px 18px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">View Lab Results — ${i.name} →</a>
        </div>`).join("")}
      </div>`
    : "";

  const html = brandedEmail({
    preheader: `Order #${opts.orderNumber} confirmed — we're on it.`,
    badge: "Order Confirmed",
    badgeColor: "#22c55e",
    headline: "YOUR ORDER IS",
    headlineAccent: "CONFIRMED.",
    body: `
      ${bodyText(`Hi ${opts.customerName}, your order has been received and is being processed. We'll send a shipping confirmation once it's on its way.`)}
      ${itemsTable(opts.items, opts.total)}
      ${dataBox([
        { label: "Order Number", value: `#${opts.orderNumber}` },
        { label: "Ship To", value: `${opts.shippingAddress.address1}, ${opts.shippingAddress.city}, ${opts.shippingAddress.state} ${opts.shippingAddress.zip}` },
        { label: "Order Total", value: `$${opts.total}`, accent: true },
      ])}
      ${coaSection}
    `,
    cta: { label: "View Your Order", url: `${SITE}/account/orders` },
    footerNote: "Questions? Reply to this email — we respond within 24 hours.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Order Confirmed — #${opts.orderNumber} · Luxurious Habbits`,
    html,
  });
}

// ─── Shipping Notification ─────────────────────────────────────────────────
export async function sendShippingNotification(opts: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  trackingCarrier?: string;
}) {
  const resend = getResend();
  const trackingBlock = opts.trackingNumber
    ? dataBox([
        { label: "Tracking Number", value: opts.trackingNumber },
        ...(opts.trackingCarrier ? [{ label: "Carrier", value: opts.trackingCarrier }] : []),
      ])
    : "";

  const html = brandedEmail({
    preheader: `Your order #${opts.orderNumber} has shipped.`,
    badge: "Shipped",
    badgeColor: "#00f5ff",
    headline: "YOUR ORDER HAS",
    headlineAccent: "SHIPPED.",
    body: `
      ${bodyText(`Hi ${opts.customerName}, great news — order #${opts.orderNumber} is on its way. Packages are shipped in discreet, unmarked packaging. Adult signature may be required upon delivery.`)}
      ${trackingBlock}
    `,
    cta: opts.trackingNumber
      ? { label: "Track Your Package", url: `https://www.ups.com/track?tracknum=${opts.trackingNumber}` }
      : { label: "View Order Status", url: `${SITE}/account/orders` },
    footerNote: "Discreet packaging. Vacuum-sealed. Odor-barrier materials. Plain unmarked box.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Your Order Has Shipped — #${opts.orderNumber} · Luxurious Habbits`,
    html,
  });
}

// ─── Review Request ────────────────────────────────────────────────────────
export async function sendReviewRequest(opts: {
  to: string;
  customerName: string;
  orderNumber: string;
  productNames: string[];
}) {
  const resend = getResend();
  const productList = opts.productNames
    .map(n => `<tr><td style="padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">· ${n}</td></tr>`)
    .join("");

  const html = brandedEmail({
    preheader: "Your review earns $1 loyalty credit. Takes 30 seconds.",
    badge: "Review & Earn",
    badgeColor: "#bf5fff",
    headline: "HOW WAS YOUR",
    headlineAccent: "EXPERIENCE?",
    body: `
      ${bodyText(`Hi ${opts.customerName}, we hope you're enjoying your recent order. Your honest feedback helps us maintain the standard we're known for — and earns you loyalty credit.`)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <tr><td style="padding-bottom:10px;"><div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;">You Ordered</div></td></tr>
        ${productList}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#bf5fff11,#7b00e011);border:1px solid #bf5fff33;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
        <tr><td>
          <div style="font-size:28px;font-weight:900;color:#bf5fff;font-family:Arial,sans-serif;">$1</div>
          <div style="font-size:10px;letter-spacing:0.15em;color:#666;text-transform:uppercase;font-family:Arial,sans-serif;margin-top:4px;">Loyalty Credit Per Review</div>
        </td></tr>
      </table>
    `,
    cta: { label: "Leave a Review & Earn Rewards", url: `${SITE}/account/orders` },
    footerNote: "Approved reviews earn loyalty points redeemable on future orders. Points never expire.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `How Was Your Order? — Leave a Review & Earn Rewards`,
    html,
  });
}

// ─── Restock Alert ─────────────────────────────────────────────────────────
export async function sendRestockAlert(opts: {
  to: string;
  productName: string;
  productSlug: string;
}) {
  const resend = getResend();
  const productUrl = `${SITE}/products/${opts.productSlug}`;

  const html = brandedEmail({
    preheader: `${opts.productName} is back in stock. Limited supply.`,
    badge: "Back in Stock",
    badgeColor: "#22c55e",
    headline: "IT'S BACK.",
    headlineAccent: "GET IT NOW.",
    body: `
      ${bodyText(`You asked us to notify you — <strong style="color:#fff;">${opts.productName}</strong> is available again. Stock is limited and moves fast.`)}
    `,
    cta: { label: "Shop Now — Limited Stock", url: productUrl, gold: true },
    footerNote: "Popular products sell out within hours. Don't miss out.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Back in Stock: ${opts.productName} · Luxurious Habbits`,
    html,
  });
}

// ─── Loyalty Milestone ────────────────────────────────────────────────────
export async function sendLoyaltyMilestone(opts: {
  to: string;
  customerName: string;
  milestone: 100 | 500 | 1000;
  totalPoints: number;
  dollarValue: number;
}) {
  const resend = getResend();
  const milestoneMessages: Record<number, { badge: string; headline: string; accent: string; sub: string; color: string }> = {
    100: {
      badge: "First Milestone",
      headline: "YOU'VE EARNED YOUR",
      accent: "FIRST REWARD.",
      sub: "100 points — that's $1 off your next order. Keep earning for bigger discounts.",
      color: "#bf5fff",
    },
    500: {
      badge: "Silver Status",
      headline: "500 POINTS.",
      accent: "YOU'RE A REGULAR.",
      sub: "You've accumulated 500 loyalty points — worth $5 off. You're one of our most valued customers.",
      color: "#c0c0c0",
    },
    1000: {
      badge: "Gold Status — Elite",
      headline: "1,000 POINTS.",
      accent: "ELITE MEMBER.",
      sub: "You've reached 1,000 loyalty points — worth $10 off. You're in our top tier. Thank you.",
      color: "#d4af37",
    },
  };
  const msg = milestoneMessages[opts.milestone];

  const html = brandedEmail({
    preheader: `You've hit ${opts.milestone} points — worth $${opts.dollarValue} off.`,
    badge: msg.badge,
    badgeColor: msg.color,
    headline: msg.headline,
    headlineAccent: msg.accent,
    body: `
      ${bodyText(`Hi ${opts.customerName}, ${msg.sub}`)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${msg.color}11,${msg.color}06);border:1px solid ${msg.color}44;border-radius:8px;padding:24px 20px;margin-bottom:24px;text-align:center;">
        <tr><td>
          <div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:10px;">Your Balance</div>
          <div style="font-size:44px;font-weight:900;color:${msg.color};font-family:Arial,sans-serif;line-height:1;">${opts.totalPoints}</div>
          <div style="font-size:11px;color:#555;margin-top:6px;font-family:Arial,sans-serif;">points &nbsp;·&nbsp; worth <strong style="color:#fff;">$${opts.dollarValue}</strong> off</div>
        </td></tr>
      </table>
    `,
    cta: { label: "Redeem Your Points", url: `${SITE}/account` },
    footerNote: "100 points = $1 off at checkout. Points never expire.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `You've Reached ${opts.milestone} Points — Luxurious Habbits`,
    html,
  });
}

// ─── Generic Email Helper ─────────────────────────────────────────────────
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const resend = getResend();
  return resend.emails.send({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html });
}

// ─── Review Reward ─────────────────────────────────────────────────────────
export async function sendReviewReward(opts: {
  to: string;
  customerName: string;
  productName: string;
  creditAmount: number;
}) {
  const resend = getResend();

  const html = brandedEmail({
    preheader: `Your $${opts.creditAmount} review credit is ready to use.`,
    badge: "Review Approved",
    badgeColor: "#22c55e",
    headline: `YOUR $${opts.creditAmount} CREDIT`,
    headlineAccent: "IS READY.",
    body: `
      ${bodyText(`Hi ${opts.customerName}, your review of <strong style="color:#fff;">${opts.productName}</strong> has been approved. We've added $${opts.creditAmount} in loyalty credit to your account.`)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#22c55e11,#16a34a06);border:1px solid #22c55e44;border-radius:8px;padding:24px 20px;margin-bottom:24px;text-align:center;">
        <tr><td>
          <div style="font-size:9px;letter-spacing:0.2em;color:#444;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:10px;">Credit Added</div>
          <div style="font-size:44px;font-weight:900;color:#22c55e;font-family:Arial,sans-serif;line-height:1;">$${opts.creditAmount}</div>
          <div style="font-size:11px;color:#555;margin-top:6px;font-family:Arial,sans-serif;">applied as <strong style="color:#fff;">${opts.creditAmount * 100} loyalty points</strong></div>
        </td></tr>
      </table>
    `,
    cta: { label: "Shop & Redeem", url: `${SITE}/products` },
    footerNote: "Thank you for helping the community. Your review matters.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Your $${opts.creditAmount} Review Credit Is Ready — Luxurious Habbits`,
    html,
  });
}

// ─── Hot Wholesale Lead Alert ────────────────────────────────────────────────
export async function sendHotLeadAlert(opts: {
  to: string;
  contactName: string;
  businessName: string;
  email: string;
  phone: string | null;
  preferredContact: string;
  preferredPayment: string | null;
  state: string;
  city: string | null;
  productsInterested: string;
  monthlyVolume: string;
  timeline: string;
  score: number;
  grade: string;
  notes: string[];
}) {
  const resend = getResend();
  const gradeEmoji = opts.grade === "hot" ? "🔥" : opts.grade === "warm" ? "♨️" : "❄️";
  const contactLabels: Record<string, string> = {
    email: "Email", phone: "Phone Call", text: "Text Message", whatsapp: "WhatsApp",
  };
  const volumeLabels: Record<string, string> = {
    under_500: "<$500/mo", "500_2000": "$500–$2k/mo", "2000_5000": "$2k–$5k/mo",
    "5000_10000": "$5k–$10k/mo", over_10000: "$10k+/mo",
  };
  const html = brandedEmail({
    preheader: `${gradeEmoji} Hot wholesale lead: ${opts.businessName} scored ${opts.score}/100`,
    badge: `${gradeEmoji} Hot Lead — Score ${opts.score}/100`,
    badgeColor: "#ff4444",
    headline: "NEW HOT",
    headlineAccent: "WHOLESALE LEAD",
    body: `
      ${dataBox([
        { label: "Contact Name", value: opts.contactName, accent: true },
        { label: "Business", value: opts.businessName },
        { label: "Email", value: opts.email },
        { label: "Phone", value: opts.phone ?? "N/A" },
        { label: "Best Contact", value: contactLabels[opts.preferredContact] ?? opts.preferredContact },
        { label: "Location", value: [opts.city, opts.state].filter(Boolean).join(", ") },
        { label: "Products Interested In", value: opts.productsInterested },
        { label: "Monthly Volume", value: volumeLabels[opts.monthlyVolume] ?? opts.monthlyVolume },
        { label: "Timeline", value: opts.timeline.replace(/_/g, " ") },
        { label: "Preferred Payment", value: opts.preferredPayment?.replace(/_/g, " ") ?? "N/A" },
      ])}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a0000;border:1px solid #ff444433;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
        <tr><td style="padding-bottom:8px;"><div style="font-size:9px;letter-spacing:0.2em;color:#ff6666;text-transform:uppercase;font-family:Arial,sans-serif;">Lead Score Signals</div></td></tr>
        <tr><td style="font-size:12px;color:#ccc;font-family:Arial,sans-serif;line-height:1.7;">${opts.notes.join(" · ")}</td></tr>
      </table>
    `,
    cta: { label: "View Lead in Admin", url: "https://www.luxurioushabbits.com/admin" },
    footerNote: "This alert fired because the lead scored ≥ 65/100. Log into the admin panel to follow up.",
  });
  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `${gradeEmoji} Hot Wholesale Lead — ${opts.businessName} (${opts.score}/100)`,
    html,
  });
}

// ─── Abandoned Cart Recovery ───────────────────────────────────────────────
export async function sendAbandonedCartRecovery(opts: {
  to: string;
  customerName?: string;
  cartItems: { name: string; quantity: number; price: string }[];
  cartTotal: string;
  cartId: number;
}) {
  const resend = getResend();
  const greeting = opts.customerName ? `Hi ${opts.customerName},` : "Hey there,";

  const html = brandedEmail({
    preheader: "Your cart is still saved. Complete your order before it sells out.",
    badge: "Cart Saved",
    badgeColor: "#00f5ff",
    headline: "YOU LEFT SOMETHING",
    headlineAccent: "BEHIND.",
    body: `
      ${bodyText(`${greeting} you started an order but didn't complete it. Your cart is still saved — but stock is limited.`)}
      ${itemsTable(opts.cartItems, opts.cartTotal)}
    `,
    cta: { label: "Complete Your Order", url: `${SITE}/checkout`, gold: true },
    footerNote: "All products are Farm Bill compliant. Discreet shipping. Adult signature required.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `You Left Something Behind — Complete Your Order`,
    html,
  });
}

// ─── Subscription Renewal Reminder ────────────────────────────────────────
export async function sendSubscriptionRenewalReminder(opts: {
  to: string;
  customerName: string;
  planName: string;
  renewalDate: string;
  amount: string;
  shippingAddress: { address1: string; city: string; state: string; zip: string };
}) {
  const resend = getResend();

  const html = brandedEmail({
    preheader: `Your Habbits Box renews on ${opts.renewalDate}.`,
    badge: "Renewal Reminder",
    badgeColor: "#00f5ff",
    headline: "YOUR HABBITS BOX",
    headlineAccent: "RENEWS SOON.",
    body: `
      ${bodyText(`Hi ${opts.customerName}, your <strong style="color:#fff;">${opts.planName}</strong> subscription is set to renew on <strong style="color:#fff;">${opts.renewalDate}</strong>. Make sure your shipping address and payment method are up to date.`)}
      ${dataBox([
        { label: "Plan", value: opts.planName },
        { label: "Renewal Date", value: opts.renewalDate },
        { label: "Amount", value: `$${opts.amount}`, accent: true },
        { label: "Ship To", value: `${opts.shippingAddress.address1}, ${opts.shippingAddress.city}, ${opts.shippingAddress.state} ${opts.shippingAddress.zip}` },
      ])}
    `,
    cta: { label: "Manage Subscription", url: `${SITE}/account` },
    footerNote: "Need to update your address or payment? Visit your account before the renewal date.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Your Habbits Box Renews in 3 Days — ${opts.planName}`,
    html,
  });
}

// ─── Restock Notification (per-product) ───────────────────────────────────
export async function sendRestockNotification(opts: {
  to: string;
  productName: string;
  productUrl: string;
}): Promise<void> {
  const fullUrl = `${SITE}${opts.productUrl}`;
  const html = brandedEmail({
    preheader: `${opts.productName} is back. Limited stock.`,
    badge: "Back in Stock",
    badgeColor: "#22c55e",
    headline: "IT'S BACK.",
    headlineAccent: "GET IT NOW.",
    body: `
      ${bodyText(`You asked us to let you know — <strong style="color:#fff;">${opts.productName}</strong> is available again. Stock is limited and moves fast.`)}
    `,
    cta: { label: "Shop Now", url: fullUrl, gold: true },
    footerNote: "Don't miss out — popular products sell out fast.",
  });
  await sendEmail({
    to: opts.to,
    subject: `Back in Stock: ${opts.productName} — Luxurious Habbits`,
    html,
  });
}

// ─── Welcome Email (Email Capture / 15% Off Popup) ────────────────────────
export async function sendWelcomeEmail(opts: {
  to: string;
  couponCode: string;
}) {
  const resend = getResend();
  const html = brandedEmail({
    preheader: `Your exclusive 15% off code is inside. One-time use.`,
    badge: "Welcome to the Inner Circle",
    badgeColor: "#d4af37",
    headline: "YOUR EXCLUSIVE",
    headlineAccent: "15% OFF CODE.",
    body: `
      ${bodyText("Use the code below at checkout to claim 15% off your first order. One-time use. No minimum required.")}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background:#0a0a0a;border:2px solid #bf5fff;border-radius:10px;padding:18px 36px;text-align:center;">
              <div style="font-size:30px;font-weight:900;letter-spacing:0.3em;color:#bf5fff;font-family:'Courier New',monospace;text-shadow:2px 0 0 #00f5ff33;">${opts.couponCode}</div>
              <div style="font-size:9px;color:#444;margin-top:6px;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">15% Off — First Order Only</div>
            </div>
          </td>
        </tr>
      </table>
    `,
    cta: { label: "Shop Now", url: `${SITE}/products`, gold: true },
    footerNote: "Only the finest. Every product is third-party lab tested, Farm Bill compliant, and sourced to the highest standard.",
  });

  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Your 15% Off Code — Welcome to Luxurious Habbits`,
    html,
  });
}
