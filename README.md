# Luxurious Habbits — Full Stack Web Application

Premium hemp e-commerce site. Black luxury aesthetic with glitch/cyberpunk elements.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL (TiDB), Drizzle ORM |
| Auth | Manus OAuth (JWT session cookies) |
| Email | Resend API |
| Payments | PayPal, NOWPayments (crypto), WalletConnect (Web3) |
| SMS | Twilio |
| Fulfillment | TopShelf (primary), Crowdship (dropship) |
| Hosting | Manus (autoscale serverless) |

---

## Project Structure

```
luxurioushabbits/
├── client/                    ← React frontend (Vite)
│   ├── index.html             ← HTML entry, meta tags, Google fonts
│   ├── public/                ← Static files (favicon, robots.txt, sitemap)
│   └── src/
│       ├── App.tsx            ← All routes (wouter router)
│       ├── main.tsx           ← React root, tRPC + QueryClient providers
│       ├── index.css          ← Global styles, CSS variables, animations
│       ├── const.ts           ← Frontend constants (login URL helper)
│       ├── _core/hooks/
│       │   └── useAuth.ts     ← useAuth() hook — current user state
│       ├── components/
│       │   ├── AgeGate.tsx    ← 21+ age verification overlay (CSS-only, SEO safe)
│       │   ├── SEO.tsx        ← Per-page meta tags, OG, JSON-LD schema
│       │   ├── Navbar.tsx     ← Top navigation
│       │   ├── Footer.tsx     ← Site footer
│       │   ├── CartDrawer.tsx ← Slide-out cart
│       │   ├── CyclingBackground.tsx ← Animated background (all pages)
│       │   ├── EmailCapturePopup.tsx ← Newsletter signup (15% coupon)
│       │   ├── StrainReviewComments.tsx ← Strain review comment system
│       │   ├── DashboardLayout.tsx ← Admin sidebar layout
│       │   └── ui/            ← shadcn/ui components
│       ├── contexts/
│       │   ├── CartContext.tsx ← Shopping cart state
│       │   └── ThemeContext.tsx
│       ├── hooks/
│       │   ├── useAnalytics.ts
│       │   └── useRecentlyViewed.ts
│       ├── data/
│       │   ├── strainColors.ts ← Strain type color mapping
│       │   └── terpenes.ts    ← Terpene data
│       ├── lib/
│       │   ├── trpc.ts        ← tRPC client setup
│       │   ├── utils.ts       ← shadcn utils (cn helper)
│       │   └── web3.ts        ← WalletConnect setup
│       └── pages/
│           ├── Home.tsx           ← Landing page (hero, pillars, categories)
│           ├── Products.tsx       ← Product listing with filters
│           ├── ProductDetail.tsx  ← Single product page
│           ├── Checkout.tsx       ← Checkout flow (PayPal, crypto, wallet)
│           ├── OrderConfirmation.tsx
│           ├── Account.tsx        ← User account, order history
│           ├── Blog.tsx           ← Blog/journal listing
│           ├── BlogPost.tsx       ← Individual blog post (28 strain reviews + education)
│           ├── StrainGuide.tsx    ← All strains index
│           ├── StrainComparison.tsx ← Side-by-side strain compare
│           ├── TerpeneGuide.tsx   ← Terpene education hub
│           ├── TerpenePage.tsx    ← Individual terpene page
│           ├── HabbitsBox.tsx     ← Subscription box tiers
│           ├── MySubscription.tsx ← Manage active subscription
│           ├── COA.tsx            ← Certificates of Analysis
│           ├── Wholesale.tsx      ← Wholesale inquiry
│           ├── Dropship.tsx       ← Dropship program
│           ├── AffiliateDashboard.tsx ← Affiliate program
│           ├── Loyalty.tsx        ← Loyalty points
│           ├── TrackOrder.tsx     ← Order tracking
│           ├── FAQ.tsx
│           ├── Contact.tsx
│           ├── About.tsx / OurStory.tsx
│           ├── Privacy.tsx / Terms.tsx / Shipping.tsx
│           ├── ShareExperience.tsx ← User experience sharing
│           ├── CryptoPayment.tsx  ← Crypto payment flow
│           ├── NotFound.tsx       ← 404 page
│           ├── Admin.tsx          ← Full admin panel (products, orders, marketing, etc.)
│           ├── AdminProduct.tsx   ← Product create/edit
│           └── admin/
│               ├── BlogEditor.tsx      ← Blog post editor
│               ├── TopShelfDashboard.tsx
│               └── CrowdshipDashboard.tsx
│
├── server/                    ← Express + tRPC backend
│   ├── index.ts               ← Server entry point
│   ├── routers.ts             ← Main tRPC router (imports all sub-routers)
│   ├── db.ts                  ← Database query helpers
│   ├── email.ts               ← Resend email helper
│   ├── paypal.ts              ← PayPal SDK wrapper
│   ├── topshelf.ts            ← TopShelf API client
│   ├── crowdshipApi.ts        ← Crowdship API client
│   ├── sms.ts                 ← Twilio SMS helper
│   ├── sitemap.ts             ← Dynamic sitemap generator
│   ├── blogRss.ts             ← RSS feed generator
│   ├── analytics.ts           ← Analytics helpers
│   ├── googleIndexing.ts      ← Google Indexing API
│   ├── indexNow.ts            ← IndexNow (Bing/Yandex)
│   ├── ageVerification.ts     ← Age gate cookie endpoints
│   ├── uploadRoutes.ts        ← File upload endpoints
│   ├── scheduledHandlers.ts   ← Cron/scheduled job handlers
│   ├── scheduledHandlers/
│   │   └── crowdshipStockSync.ts
│   ├── storage.ts             ← S3 file storage helpers
│   ├── walletConnect.ts       ← Web3 wallet auth
│   ├── authorizenet.ts        ← Authorize.Net payment (optional)
│   ├── routers/               ← Feature-specific tRPC routers
│   │   ├── catalog.ts         ← Products, variants, inventory
│   │   ├── orders.ts          ← Order creation, management
│   │   ├── paypal.ts          ← PayPal payment procedures
│   │   ├── cryptoPayments.ts  ← NOWPayments crypto procedures
│   │   ├── walletAuth.ts      ← Web3 wallet auth procedures
│   │   ├── campaigns.ts       ← Email newsletter campaigns
│   │   ├── emailCaptures.ts   ← Newsletter subscriber list
│   │   ├── abandonedCarts.ts  ← Abandoned cart recovery emails
│   │   ├── affiliates.ts      ← Affiliate program
│   │   ├── referrals.ts       ← Referral system
│   │   ├── loyalty.ts         ← Loyalty points
│   │   ├── coupons.ts         ← Coupon codes
│   │   ├── reviews.ts         ← Product reviews
│   │   ├── strainComments.ts  ← Strain review comments
│   │   ├── productQA.ts       ← Product Q&A
│   │   ├── subscriptions.ts   ← Habbits Box subscriptions
│   │   ├── addresses.ts       ← User saved addresses
│   │   ├── wishlists.ts       ← Wishlists
│   │   ├── notifyMe.ts        ← Back-in-stock notifications
│   │   ├── restockNotifications.ts
│   │   ├── orderTracking.ts   ← Order tracking
│   │   ├── terpenes.ts        ← Terpene data
│   │   ├── blog.ts            ← Blog/CMS procedures
│   │   ├── admin.ts           ← Admin-only procedures
│   │   ├── siteSettings.ts    ← Site configuration
│   │   ├── siteAnalytics.ts   ← Analytics dashboard data
│   │   ├── topshelf.ts        ← TopShelf sync procedures
│   │   ├── crowdship.ts       ← Crowdship sync procedures
│   │   ├── wholesale.ts       ← Wholesale applications
│   │   ├── dropshipApplications.ts
│   │   ├── gbpReviews.ts      ← Google Business Profile reviews
│   │   └── addresses.ts
│   └── _core/                 ← Framework plumbing (DO NOT edit)
│       ├── index.ts           ← Server bootstrap
│       ├── context.ts         ← tRPC context (user injection)
│       ├── trpc.ts            ← tRPC init, publicProcedure, protectedProcedure, adminProcedure
│       ├── oauth.ts           ← Manus OAuth flow
│       ├── env.ts             ← Environment variable access
│       ├── llm.ts             ← LLM (AI) helper
│       ├── imageGeneration.ts ← AI image generation helper
│       ├── voiceTranscription.ts ← Whisper transcription helper
│       ├── notification.ts    ← Owner notification helper
│       ├── map.ts             ← Google Maps proxy
│       ├── sdk.ts             ← Manus SDK
│       └── storageProxy.ts    ← S3 storage proxy
│
├── drizzle/                   ← Database schema and migrations
│   ├── schema.ts              ← ALL database table definitions (source of truth)
│   ├── relations.ts           ← Drizzle table relations
│   ├── 0000_*.sql → 0038_*.sql ← Migration files (run in order)
│   └── meta/                  ← Drizzle migration snapshots
│
├── shared/                    ← Code shared between client and server
│   ├── types.ts               ← Shared TypeScript types
│   ├── const.ts               ← Shared constants (error messages)
│   └── thcaRestrictions.ts    ← State-level THCA shipping restrictions
│
├── references/
│   └── periodic-updates.md    ← Heartbeat/cron job documentation
│
├── package.json               ← Dependencies and scripts
├── pnpm-lock.yaml             ← Exact dependency versions (DO NOT edit manually)
├── vite.config.ts             ← Vite build config
├── tsconfig.json              ← TypeScript config
├── tsconfig.node.json         ← TypeScript config for Node
├── drizzle.config.ts          ← Drizzle ORM config
├── vitest.config.ts           ← Test config
├── components.json            ← shadcn/ui config
├── ENV_TEMPLATE.txt           ← All environment variable names (rename to .env)
└── todo.md                    ← Feature checklist and project history
```

---

## Database Tables (drizzle/schema.ts)

| Table | Purpose |
|---|---|
| `users` | Registered users (role: admin/user) |
| `products` | Product catalog |
| `productVariants` | Size/weight variants per product |
| `productImages` | Product image URLs |
| `orders` | Customer orders |
| `orderItems` | Line items per order |
| `orderTracking` | Shipment tracking events |
| `addresses` | Saved shipping addresses |
| `reviews` | Product reviews (star rating + text) |
| `strainReviewComments` | Strain blog post comments (with photo upload) |
| `productQA` | Product Q&A pairs |
| `emailCaptures` | Newsletter subscriber list |
| `emailCampaigns` | Broadcast email campaigns |
| `coupons` | Discount coupon codes |
| `loyaltyPoints` | Loyalty point ledger |
| `loyaltyTiers` | Loyalty tier definitions |
| `affiliates` | Affiliate accounts |
| `affiliateClicks` | Affiliate link click tracking |
| `referrals` | Referral program |
| `subscriptions` | Habbits Box subscriptions |
| `wishlists` | User wishlists |
| `notifyMeRequests` | Back-in-stock notification requests |
| `abandonedCarts` | Abandoned cart recovery |
| `dropshipApplications` | Dropship program applications |
| `wholesaleApplications` | Wholesale inquiry submissions |
| `siteSettings` | Key-value site configuration |
| `siteAnalyticsEvents` | Custom analytics events |
| `terpenes` | Terpene data |
| `scheduledJobs` | Cron job tracking |

---

## Scripts

```bash
pnpm dev          # Start dev server (Express + Vite HMR on port 3000)
pnpm build        # Build for production
pnpm test         # Run Vitest tests
pnpm db:push      # Generate + run database migrations (drizzle-kit)
pnpm format       # Prettier format
```

---

## How to Run Locally

### Prerequisites
- Node.js 22+
- pnpm (`npm install -g pnpm`)
- MySQL database (local or TiDB cloud)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp ENV_TEMPLATE.txt .env
# Edit .env with your real values (minimum: DATABASE_URL, JWT_SECRET)

# 3. Push database schema
pnpm db:push

# 4. Start dev server
pnpm dev
# → Opens at http://localhost:3000
```

### Minimum Required Secrets for Local Dev

```
DATABASE_URL=mysql://...
JWT_SECRET=any-random-32-char-string
VITE_APP_ID=any-string-for-local
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

---

## How to Deploy (Manus)

1. Open the project in Manus
2. Click **Publish** in the Management UI header
3. The site auto-deploys to `https://www.luxurioushabbits.com`

All secrets are managed via **Settings → Secrets** in the Management UI.

---

## Key Patterns

### Adding a new tRPC procedure

```ts
// server/routers/myFeature.ts
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";

export const myFeatureRouter = router({
  getAll: publicProcedure.query(async () => {
    // public — no auth required
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.user is the logged-in user
    }),
  adminOnly: adminProcedure.query(async ({ ctx }) => {
    // ctx.user.role === "admin" guaranteed
  }),
});
```

Then register in `server/routers.ts`:
```ts
import { myFeatureRouter } from "./routers/myFeature";
export const appRouter = router({
  // ...existing routers
  myFeature: myFeatureRouter,
});
```

### Calling from frontend

```tsx
// Query
const { data, isLoading } = trpc.myFeature.getAll.useQuery();

// Mutation
const create = trpc.myFeature.create.useMutation({
  onSuccess: () => utils.myFeature.getAll.invalidate(),
});
await create.mutateAsync({ name: "test" });
```

### Auth state in components

```tsx
import { useAuth } from "@/_core/hooks/useAuth";
const { user, isAuthenticated, loading, logout } = useAuth();
```

### Admin role check

```tsx
// Frontend
const { user } = useAuth();
if (user?.role !== "admin") return <Redirect to="/" />;

// Backend (use adminProcedure — it throws FORBIDDEN automatically)
adminProcedure.query(async ({ ctx }) => { ... })
```

---

## CDN Images (Manus Storage)

These images are hosted on the Manus CDN. If moving to a new project, re-upload and update the URLs:

| URL | Used In |
|---|---|
| `/manus-storage/optical_illusion_549ade92.webp` | Age gate + hero background (rotating swirl) |
| `/manus-storage/logo_14152948.png` | Age gate, navbar, emails |
| `/manus-storage/logo_skull_transparent_ad0d5e8b.png` | Age gate flash effect |
| `/manus-storage/og-image.jpg` | Open Graph social sharing image |
| `/manus-storage/puffco-onyx-angle.jpg` | Puffco Peak Pro Onyx product |
| `/manus-storage/puffco-onyx-front.png` | Puffco Peak Pro Onyx product |
| `/manus-storage/puffco-onyx-side.png` | Puffco Peak Pro Onyx product |
| `/manus-storage/puffco-onyx-chamber.png` | Puffco Peak Pro Onyx product |
| `/manus-storage/puffco-onyx-detail.png` | Puffco Peak Pro Onyx product |
| `/manus-storage/puffco-peak-pro-onyx.png` | Puffco Peak Pro Onyx product |
| `/manus-storage/email_header_animated.gif` | Transactional email header |

---

## Design System

- **Font:** Bebas Neue (headings), Cormorant Garamond (body italic), Inter (UI)
- **Colors:** Black (`oklch(0.04 0 0)`) base, purple (`#bf5fff`), cyan (`#00f5ff`), gold (`#ffd700`)
- **Theme:** Dark only (`defaultTheme="dark"` in App.tsx)
- **Animations:** Glitch effects, scan lines, slow-rotate background, fade-up entrances
- **CSS classes:** `.btn-gold`, `.btn-outline-white`, `.text-holo`, `.glitch`, `.section-label`, `.gold-divider`, `.scanlines`

All global styles and animations are in `client/src/index.css`.

---

## Admin Panel

Access at `/admin` (requires admin role in database).

**Tabs:** Products, Orders, Inventory, Marketing (Campaigns, Coupons, Affiliates, Loyalty, Abandoned Carts, Referrals), Customers, Analytics, Blog, TopShelf, Crowdship, Settings, Comments.

**To promote a user to admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Project History

See `luxurioushabbits_handoff.md` for the complete build history, every feature decision, and what still needs to be done.
