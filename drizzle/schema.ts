import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  loyaltyTier: mysqlEnum("loyaltyTier", ["standard", "elevated", "luxurious"]).default("standard").notNull(),
  subscriptionStreak: int("subscriptionStreak").default(0).notNull(),
  walletAddress: varchar("walletAddress", { length: 42 }).unique(),
  phone: varchar("phone", { length: 30 }),
  smsOptIn: boolean("smsOptIn").default(false).notNull(),
  nickname: varchar("nickname", { length: 50 }), // optional display name shown on comments instead of real name
  profilePhotoKey: text("profilePhotoKey"), // S3 key for user profile photo
  isWholesale: boolean("isWholesale").default(false).notNull(), // wholesale account flag
  wholesaleApprovedAt: timestamp("wholesaleApprovedAt"), // when wholesale was granted
  passwordHash: text("passwordHash"), // bcrypt hash for email/password auth
  resetToken: varchar("resetToken", { length: 128 }), // password reset token
  resetTokenExpiry: timestamp("resetTokenExpiry"), // when reset token expires
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Newsletter subscribers
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// ─────────────────────────────────────────────
// VENDORS — Dropship suppliers (TopShelfNC, etc.)
// ─────────────────────────────────────────────
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  websiteUrl: text("websiteUrl"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactName: varchar("contactName", { length: 200 }),
  integrationMethod: mysqlEnum("integrationMethod", ["email", "api", "manual"]).default("email").notNull(),
  apiEndpoint: text("apiEndpoint"),
  apiKey: text("apiKey"),
  orderEmail: varchar("orderEmail", { length: 320 }),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  hideVendor: boolean("hideVendor").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

// ─────────────────────────────────────────────
// PRODUCTS — Hemp flower, extracts, etc.
// ─────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tagline: varchar("tagline", { length: 500 }),
  description: text("description"),
  category: mysqlEnum("category", ["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).default("flower").notNull(),
  strainType: mysqlEnum("strainType", ["indica", "sativa", "hybrid", "cbd", "cbg"]),
  genetics: varchar("genetics", { length: 500 }),
  cultivation: varchar("cultivation", { length: 255 }),
  thcaPercent: decimal("thcaPercent", { precision: 5, scale: 2 }),
  cbdPercent: decimal("cbdPercent", { precision: 5, scale: 2 }),
  terpenes: text("terpenes"), // JSON array of terpene names
  effectTags: text("effectTags"), // JSON array: ["relaxing","euphoric","creative"]
  weightGrams: decimal("weightGrams", { precision: 8, scale: 2 }),
  retailPrice: decimal("retailPrice", { precision: 10, scale: 2 }).notNull(),
  wholesalePrice: decimal("wholesalePrice", { precision: 10, scale: 2 }),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  imageUrl: text("imageUrl"),
  coaUrl: text("coaUrl"),
  coaLab: varchar("coaLab", { length: 255 }),
  coaBatch: varchar("coaBatch", { length: 100 }),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isOutOfStock: boolean("isOutOfStock").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  // TopShelf dropship integration — maps this product to a TopShelf variation
  topshelfVariationId: int("topshelfVariationId"),   // null = not a TopShelf product
  topshelfProductId: int("topshelfProductId"),         // WooCommerce parent product ID (required for inventory deduction)
  topshelfSku: varchar("topshelfSku", { length: 100 }), // TopShelf SKU for reference
  topshelfRetailPrice: decimal("topshelfRetailPrice", { precision: 10, scale: 2 }), // TopShelf's own retail price (from WC, used for WC order line items before coupon)
  // Crowdship dropship integration
  crowdshipVariantId: varchar("crowdshipVariantId", { length: 100 }), // null = not a Crowdship product
  crowdshipSku: varchar("crowdshipSku", { length: 100 }), // Crowdship SKU for order submission
  crowdshipSupplierId: varchar("crowdshipSupplierId", { length: 100 }), // Crowdship supplier ID
  // Product variation grouping — products sharing the same parentProductId are variations of each other
  parentProductId: int("parentProductId"), // null = standalone product or the parent itself
  variationLabel: varchar("variationLabel", { length: 100 }), // e.g. "3.5g", "7g", "28g (1oz)"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Product images (gallery)
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;

// Product terpenes (many-to-many join table — links products to terpene slugs with percentage)
export const productTerpenes = mysqlTable("product_terpenes", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  terpeneSlug: varchar("terpeneSlug", { length: 100 }).notNull(), // e.g. "beta-myrcene", "limonene"
  terpeneName: varchar("terpeneName", { length: 100 }).notNull(), // e.g. "beta-Myrcene"
  percentage: decimal("percentage", { precision: 6, scale: 4 }), // e.g. 0.3500
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductTerpene = typeof productTerpenes.$inferSelect;
export type InsertProductTerpene = typeof productTerpenes.$inferInsert;

// Product tags (many-to-many via join table)
export const productTags = mysqlTable("product_tags", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  tag: varchar("tag", { length: 100 }).notNull(),
});

// ─────────────────────────────────────────────
// ORDERS — Customer orders and dropship
// ─────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId"), // linked user account (null for guest orders)
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  shippingName: varchar("shippingName", { length: 200 }).notNull(),
  shippingAddress1: varchar("shippingAddress1", { length: 300 }).notNull(),
  shippingAddress2: varchar("shippingAddress2", { length: 300 }),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  shippingState: varchar("shippingState", { length: 50 }).notNull(),
  shippingZip: varchar("shippingZip", { length: 20 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingCarrier: varchar("trackingCarrier", { length: 50 }),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  customerPhone: varchar("customerPhone", { length: 30 }),
  smsOptIn: boolean("smsOptIn").default(false).notNull(),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
  referralCode: varchar("referralCode", { length: 20 }),
  affiliateCode: varchar("affiliateCode", { length: 20 }), // affiliate attribution code from ?ref= param
  nowpaymentsPaymentId: varchar("nowpaymentsPaymentId", { length: 100 }), // NOWPayments payment ID for crypto orders
  paidAt: timestamp("paidAt"), // when crypto payment was confirmed
  // Authorize.net payment tracking
  paymentTransactionId: varchar("paymentTransactionId", { length: 100 }), // Authorize.net transaction ID after successful charge
  paymentAuthCode: varchar("paymentAuthCode", { length: 50 }), // Authorize.net authorization code
  // TopShelf dropship tracking
  topshelfOrderNumber: varchar("topshelfOrderNumber", { length: 100 }), // TSDM order number returned by TopShelf
  topshelfSubmittedAt: timestamp("topshelfSubmittedAt"), // when order was sent to TopShelf
  topshelfError: text("topshelfError"), // last submission error (null = success)
  // Crowdship dropship tracking
  crowdshipOrderId: varchar("crowdshipOrderId", { length: 100 }), // Crowdship order ID after manual submission
  crowdshipSubmittedAt: timestamp("crowdshipSubmittedAt"), // when order was manually marked submitted
  // Soft-delete trash — deletedAt is set when admin trashes an order; null means active
  deletedAt: timestamp("deletedAt"),
  deletedBy: varchar("deletedBy", { length: 100 }), // admin user who deleted it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  vendorId: int("vendorId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("lineTotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const vendorOrders = mysqlTable("vendor_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  vendorId: int("vendorId").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "confirmed", "shipped", "delivered"]).default("pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendorOrder = typeof vendorOrders.$inferSelect;

// ─────────────────────────────────────────────
// SUBSCRIPTIONS — The Habbits Box
// ─────────────────────────────────────────────
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  features: text("features"), // JSON array
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  freeShipping: boolean("freeShipping").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const customerSubscriptions = mysqlTable("customer_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId"), // linked user account (optional — guest subs have null)
  // Contact info
  contactName: varchar("contactName", { length: 200 }),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 30 }),
  // Business info (for Smoke Shop tier)
  businessName: varchar("businessName", { length: 255 }),
  businessAddress: text("businessAddress"),
  customBudget: decimal("customBudget", { precision: 10, scale: 2 }),
  // Shipping
  shippingName: varchar("shippingName", { length: 200 }).notNull(),
  shippingAddress1: varchar("shippingAddress1", { length: 300 }).notNull(),
  shippingAddress2: varchar("shippingAddress2", { length: 300 }),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  shippingState: varchar("shippingState", { length: 50 }).notNull(),
  shippingZip: varchar("shippingZip", { length: 20 }).notNull(),
  // Subscription details
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly"]).default("monthly").notNull(),
  status: mysqlEnum("status", ["pending_approval", "active", "paused", "cancelled"]).default("pending_approval").notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  boxCount: int("boxCount").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerSubscription = typeof customerSubscriptions.$inferSelect;
export type InsertCustomerSubscription = typeof customerSubscriptions.$inferInsert;

export const subscriptionOrders = mysqlTable("subscription_orders", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  orderId: int("orderId"),
  periodLabel: varchar("periodLabel", { length: 50 }).notNull(), // e.g. "2025-01"
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "skipped"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Habbits Box monthly contents (curated by admin)
export const habbitsBoxContents = mysqlTable("habbits_box_contents", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  periodLabel: varchar("periodLabel", { length: 50 }).notNull(), // e.g. "2025-01"
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabbitsBoxContent = typeof habbitsBoxContents.$inferSelect;

// Smoke Shop inquiries (Habbits Box custom tier)
export const smokeShopInquiries = mysqlTable("smoke_shop_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  contactName: varchar("contactName", { length: 200 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 30 }),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessAddress: text("businessAddress"),
  monthlyBudget: decimal("monthlyBudget", { precision: 10, scale: 2 }).notNull(),
  shippingAddress1: varchar("shippingAddress1", { length: 255 }).notNull(),
  shippingAddress2: varchar("shippingAddress2", { length: 255 }),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  shippingState: varchar("shippingState", { length: 50 }).notNull(),
  shippingZip: varchar("shippingZip", { length: 20 }).notNull(),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  status: mysqlEnum("status", ["pending", "contacted", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SmokeShopInquiry = typeof smokeShopInquiries.$inferSelect;
export type InsertSmokeShopInquiry = typeof smokeShopInquiries.$inferInsert;

// ─────────────────────────────────────────────
// WHOLESALE LEADS — Bulk buyer qualification
// ─────────────────────────────────────────────
export const wholesaleLeads = mysqlTable("wholesale_leads", {
  id: int("id").autoincrement().primaryKey(),

  // ── Contact & Identity ──────────────────────
  contactName: varchar("contactName", { length: 200 }).notNull(),
  title: varchar("title", { length: 100 }), // e.g. "Owner", "Buyer", "Manager"
  businessName: varchar("businessName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),

  // ── Online Presence ─────────────────────────
  website: varchar("website", { length: 500 }),
  instagram: varchar("instagram", { length: 200 }),
  facebook: varchar("facebook", { length: 200 }),
  tiktok: varchar("tiktok", { length: 200 }),
  twitter: varchar("twitter", { length: 200 }),
  youtube: varchar("youtube", { length: 200 }),
  otherSocials: text("otherSocials"), // free text for anything else

  // ── Business Details ────────────────────────
  state: varchar("state", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }),
  businessType: mysqlEnum("businessType", [
    "smoke_shop",
    "dispensary",
    "online_retailer",
    "gym_wellness",
    "bar_restaurant",
    "distributor",
    "convenience_store",
    "vape_shop",
    "other",
  ]).notNull(),
  businessTypeOther: varchar("businessTypeOther", { length: 200 }),
  yearsInBusiness: mysqlEnum("yearsInBusiness", [
    "less_than_1",
    "1_2",
    "3_5",
    "6_10",
    "over_10",
  ]),
  numberOfLocations: mysqlEnum("numberOfLocations", [
    "1",
    "2_5",
    "6_10",
    "over_10",
  ]),
  averageMonthlyRevenue: mysqlEnum("averageMonthlyRevenue", [
    "under_10k",
    "10k_50k",
    "50k_100k",
    "100k_500k",
    "over_500k",
  ]),

  // ── Customer Demographics ───────────────────
  targetDemographic: text("targetDemographic"), // free text: who their customers are
  avgCustomerAge: mysqlEnum("avgCustomerAge", [
    "21_25",
    "26_35",
    "36_45",
    "46_plus",
    "mixed",
  ]),

  // ── Purchase Intent ─────────────────────────
  monthlyVolume: mysqlEnum("monthlyVolume", [
    "under_500",
    "500_2000",
    "2000_5000",
    "5000_10000",
    "over_10000",
  ]).notNull(),
  productsInterested: text("productsInterested").notNull(), // JSON array: ["flower","extracts"]
  timeline: mysqlEnum("timeline", [
    "immediately",
    "within_30_days",
    "1_3_months",
    "just_exploring",
  ]).notNull(),

  // ── Current Supplier Info ───────────────────
  currentSupplier: varchar("currentSupplier", { length: 255 }),
  currentSpendMonthly: mysqlEnum("currentSpendMonthly", [
    "none",
    "under_500",
    "500_2000",
    "2000_5000",
    "over_5000",
  ]),
  whySwitch: text("whySwitch"), // why they want to switch/add us

  // ── Preferred Contact Method ──────────────────────
  preferredContact: mysqlEnum("preferredContact", ["email", "phone", "text", "whatsapp"]).notNull().default("email"),

  // ── Preferred Payment Method ──────────────────────
  preferredPayment: mysqlEnum("preferredPayment", ["bank_transfer", "check", "credit_card", "crypto", "net_terms", "other"]).default("bank_transfer"),

  // ── Compliance & Awareness ──────────────────────
  farmBillAware: boolean("farmBillAware").default(false).notNull(),
  hasRetailLicense: boolean("hasRetailLicense").default(false).notNull(),
  stateCompliant: boolean("stateCompliant").default(false).notNull(),

  // ── Additional Context ──────────────────────
  howHeard: mysqlEnum("howHeard", [
    "google",
    "instagram",
    "tiktok",
    "referral",
    "trade_show",
    "other",
  ]),
  additionalNotes: text("additionalNotes"),

  // ── Lead Scoring (0–100, computed server-side) ──
  leadScore: int("leadScore").notNull().default(0),
  leadGrade: mysqlEnum("leadGrade", ["hot", "warm", "cold"]).notNull().default("cold"),

  // ── Admin Workflow ──────────────────────────
  status: mysqlEnum("status", [
    "new",
    "contacted",
    "qualified",
    "disqualified",
    "closed_won",
    "closed_lost",
  ]).default("new").notNull(),
  adminNotes: text("adminNotes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WholesaleLead = typeof wholesaleLeads.$inferSelect;
export type InsertWholesaleLead = typeof wholesaleLeads.$inferInsert;

// ─────────────────────────────────────────────
// NOTIFY ME LEADS — Email capture for Coming Soon categories
// ─────────────────────────────────────────────
export const notifyMeLeads = mysqlTable("notify_me_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // "flower" | "extracts" | "general"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NotifyMeLead = typeof notifyMeLeads.$inferSelect;
export type InsertNotifyMeLead = typeof notifyMeLeads.$inferInsert;

// ─────────────────────────────────────────────
// LOYALTY POINTS — Earn & redeem rewards
// ─────────────────────────────────────────────
export const loyaltyPoints = mysqlTable("loyalty_points", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  points: int("points").notNull(), // positive = earned, negative = redeemed
  reason: mysqlEnum("reason", [
    "purchase",           // 1 pt per $1 spent
    "review_approved",    // +1 pt ($1 reward) per approved review
    "subscription_bonus", // double points for Habbit Box subscribers
    "redemption",         // negative: points used at checkout
    "admin_adjustment",   // manual admin credit/debit
    "signup_bonus",       // bonus for newsletter signup
    "admin_gift",         // surprise gift from admin
  ]).notNull(),
  orderId: int("orderId"),    // linked order (for purchase/redemption)
  reviewId: int("reviewId"),  // linked review (for review_approved)
  note: varchar("note", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LoyaltyPoint = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoint = typeof loyaltyPoints.$inferInsert;

// ─────────────────────────────────────────────
// LOYALTY REDEMPTIONS — Track discount usage
// ─────────────────────────────────────────────
export const loyaltyRedemptions = mysqlTable("loyalty_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pointsUsed: int("pointsUsed").notNull(),
  discountCents: int("discountCents").notNull(), // 100 pts = $1 = 100 cents
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LoyaltyRedemption = typeof loyaltyRedemptions.$inferSelect;
export type InsertLoyaltyRedemption = typeof loyaltyRedemptions.$inferInsert;

// ─────────────────────────────────────────────
// PENDING GIFTS — Admin-gifted credits waiting to show the congratulations popup
// ─────────────────────────────────────────────
export const pendingGifts = mysqlTable("pending_gifts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  points: int("points").notNull(),
  message: varchar("message", { length: 500 }).default("You've been selected for a special reward!").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PendingGift = typeof pendingGifts.$inferSelect;
export type InsertPendingGift = typeof pendingGifts.$inferInsert;

// ─────────────────────────────────────────────
// PRODUCT REVIEWS — Customer reviews with loyalty reward
// ─────────────────────────────────────────────
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  reviewText: text("reviewText").notNull(),
  reviewerName: varchar("reviewerName", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectReason: varchar("rejectReason", { length: 255 }),
  rewardIssued: boolean("rewardIssued").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

// ─────────────────────────────────────────────
// COUPON CODES — Newsletter signup discount codes
// ─────────────────────────────────────────────
export const couponCodes = mysqlTable("coupon_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  discountPct: int("discountPct").notNull().default(15), // percentage off
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("usedAt"),
  orderId: int("orderId"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CouponCode = typeof couponCodes.$inferSelect;
export type InsertCouponCode = typeof couponCodes.$inferInsert;

// ─────────────────────────────────────────────
// REFERRALS — Customer referral program
// ─────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // user who shared the link
  referralCode: varchar("referralCode", { length: 16 }).notNull().unique(),
  referredEmail: varchar("referredEmail", { length: 320 }),
  referredUserId: int("referredUserId"), // set when referred user registers
  orderId: int("orderId"), // set when referred user places first order
  status: mysqlEnum("status", ["pending", "converted", "rewarded"]).default("pending").notNull(),
  rewardCents: int("rewardCents").default(500).notNull(), // $5 in cents
  rewardIssuedAt: timestamp("rewardIssuedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// ─────────────────────────────────────────────
// WISHLISTS — Customer saved products
// ─────────────────────────────────────────────
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// ─────────────────────────────────────────────
// GBP REVIEW SUBMISSIONS — Google Business Profile review screenshot claims
// ─────────────────────────────────────────────
export const gbpReviewSubmissions = mysqlTable("gbp_review_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  screenshotUrl: text("screenshotUrl").notNull(), // S3 URL
  screenshotKey: text("screenshotKey").notNull(), // S3 key
  reviewerName: varchar("reviewerName", { length: 100 }).notNull(), // name shown on Google review
  status: mysqlEnum("status", ["pending", "approved", "rejected", "duplicate"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  creditIssued: boolean("creditIssued").default(false).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});
export type GbpReviewSubmission = typeof gbpReviewSubmissions.$inferSelect;
export type InsertGbpReviewSubmission = typeof gbpReviewSubmissions.$inferInsert;

// ─────────────────────────────────────────────
// ABANDONED CARTS — For recovery email flow
// ─────────────────────────────────────────────
export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),                              // null for guests
  email: varchar("email", { length: 320 }).notNull(), // required for recovery email
  cartData: text("cartData").notNull(),               // JSON: [{productId, name, qty, price}]
  totalCents: int("totalCents").notNull(),
  recoveryEmailSentAt: timestamp("recoveryEmailSentAt"),   // step 1 (1hr)
  email2SentAt: timestamp("email2SentAt"),                  // step 2 (24hr)
  email3SentAt: timestamp("email3SentAt"),                  // step 3 (72hr)
  recoveredAt: timestamp("recoveredAt"),              // set when cart converts to order
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

// ─────────────────────────────────────────────
// AFFILIATES — Unique links, commission tracking
// ─────────────────────────────────────────────
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 20 }).notNull().unique(),
  commissionPercent: decimal("commissionPercent", { precision: 5, scale: 2 }).default("10.00").notNull(),
  status: mysqlEnum("status", ["active", "paused", "terminated"]).default("active").notNull(),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  totalEarnedCents: int("totalEarnedCents").default(0).notNull(),
  totalPaidCents: int("totalPaidCents").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrerUrl: text("referrerUrl"),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export const affiliateConversions = mysqlTable("affiliate_conversions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  orderId: int("orderId").notNull(),
  orderTotalCents: int("orderTotalCents").notNull(),
  commissionCents: int("commissionCents").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "reversed"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AffiliateConversion = typeof affiliateConversions.$inferSelect;


// ─────────────────────────────────────────────
// EMAIL CAPTURES — First-time visitor popup
// ─────────────────────────────────────────────
export const emailCaptures = mysqlTable("email_captures", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  couponCode: varchar("couponCode", { length: 32 }),
  discountPct: int("discountPct").default(15).notNull(),
  source: varchar("source", { length: 64 }).default("popup").notNull(),
  used: boolean("used").default(false).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = typeof emailCaptures.$inferInsert;

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ORDER TRACKING — Real status + tracking info
// ─────────────────────────────────────────────
// trackingNumber, trackingCarrier, shippedAt added to orders table via migration
// This table stores status history events
export const orderStatusHistory = mysqlTable("order_status_history", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;

// ─────────────────────────────────────────────
// RESTOCK NOTIFICATIONS — Per-product notify me
// ─────────────────────────────────────────────
export const restockNotifications = mysqlTable("restock_notifications", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  notified: boolean("notified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RestockNotification = typeof restockNotifications.$inferSelect;
export type InsertRestockNotification = typeof restockNotifications.$inferInsert;

// ─────────────────────────────────────────────
// USER ADDRESSES — Saved address book
// ─────────────────────────────────────────────
export const userAddresses = mysqlTable("user_addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 64 }).default("Home").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  address1: varchar("address1", { length: 255 }).notNull(),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UserAddress = typeof userAddresses.$inferSelect;
export type InsertUserAddress = typeof userAddresses.$inferInsert;

// ─────────────────────────────────────────────
// PRODUCT Q&A — Customer questions + admin answers
// ─────────────────────────────────────────────
export const productQuestions = mysqlTable("product_questions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredAt: timestamp("answeredAt"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProductQuestion = typeof productQuestions.$inferSelect;
export type InsertProductQuestion = typeof productQuestions.$inferInsert;

// ─────────────────────────────────────────────
// PAGE VIEWS — Lightweight analytics tracking
// ─────────────────────────────────────────────
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

// ─────────────────────────────────────────────
// ACTIVE SESSIONS — Real-time visitor presence (heartbeat)
// ─────────────────────────────────────────────
export const activeSessions = mysqlTable("active_sessions", {
  sessionId: varchar("sessionId", { length: 64 }).primaryKey(),
  path: varchar("path", { length: 500 }).notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  walletAddress: varchar("walletAddress", { length: 64 }),
  ipAddress: varchar("ipAddress", { length: 64 }),
  city: varchar("city", { length: 128 }),
  region: varchar("region", { length: 128 }),
  country: varchar("country", { length: 64 }),
  deviceType: mysqlEnum("deviceType", ["mobile", "tablet", "desktop"]).default("desktop"),
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  isAdmin: boolean("isAdmin").default(false),
  timezone: varchar("timezone", { length: 100 }), // e.g. America/Chicago
  browserLanguage: varchar("browserLanguage", { length: 20 }), // e.g. en-US
  referrer: varchar("referrer", { length: 500 }), // where they came from
  pageCount: int("pageCount").default(1), // number of pages viewed this session
});
export type ActiveSession = typeof activeSessions.$inferSelect;

// ─────────────────────────────────────────────
// REVIEW CREDITS — Track per-purchase review eligibility (one $1 credit per purchase instance)
// ─────────────────────────────────────────────
export const reviewCredits = mysqlTable("review_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  orderId: int("orderId").notNull(),
  reviewId: int("reviewId"),          // set when review is submitted
  creditIssuedAt: timestamp("creditIssuedAt"), // set when review is approved
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ReviewCredit = typeof reviewCredits.$inferSelect;
export type InsertReviewCredit = typeof reviewCredits.$inferInsert;

// ─────────────────────────────────────────────
// EMAIL CAMPAIGNS — Newsletter broadcast campaigns
// ─────────────────────────────────────────────
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  previewText: varchar("previewText", { length: 255 }),
  htmlBody: text("htmlBody").notNull(),
  status: mysqlEnum("status", ["draft", "sending", "sent", "failed"]).default("draft").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  sentCount: int("sentCount").default(0).notNull(),
  sentAt: timestamp("sentAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

// ─────────────────────────────────────────────
// DROPSHIP APPLICATIONS — Partner applications to resell
// ─────────────────────────────────────────────
export const dropshipApplications = mysqlTable("dropship_applications", {
  id: int("id").autoincrement().primaryKey(),
  // Contact
  contactName: varchar("contactName", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  // Business info
  businessName: varchar("businessName", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  instagram: varchar("instagram", { length: 200 }),
  // Sales info
  currentPlatforms: text("currentPlatforms"), // e.g. "Shopify, Amazon"
  monthlyVolume: varchar("monthlyVolume", { length: 100 }), // e.g. "$5k-$10k"
  whyPartner: text("whyPartner"), // free-form motivation
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DropshipApplication = typeof dropshipApplications.$inferSelect;
export type InsertDropshipApplication = typeof dropshipApplications.$inferInsert;

// ─────────────────────────────────────────────
// SITE SETTINGS — Admin-controlled global config (test mode, etc.)
// ─────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ─────────────────────────────────────────────
// BLOG POSTS — Admin-managed articles
// ─────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).default("General").notNull(),
  tags: text("tags"), // JSON array of tag strings
  coverImage: text("coverImage"), // URL
  authorName: varchar("authorName", { length: 255 }).default("Luxurious Habbits").notNull(),
  metaTitle: varchar("metaTitle", { length: 500 }),
  metaDescription: text("metaDescription"),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  readTimeMinutes: int("readTimeMinutes").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─────────────────────────────────────────────
// STRAIN REVIEW COMMENTS — Logged-in users only
// ─────────────────────────────────────────────
export const strainReviewComments = mysqlTable("strain_review_comments", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(), // blog slug e.g. "gelato-thca-strain-review"
  userId: int("userId").notNull(),                  // FK to users.id — login required
  userName: varchar("userName", { length: 255 }).notNull(), // snapshot of user.name at time of post
  rating: int("rating").notNull(),                  // 1–5 stars
  body: text("body").notNull(),                     // comment text
  photoKey: text("photoKey"),                       // S3 key for optional uploaded bud photo
  approved: boolean("approved").default(false).notNull(), // admin must approve before public display
  verifiedPurchase: boolean("verifiedPurchase").default(false).notNull(), // true if user has a completed order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type StrainReviewComment = typeof strainReviewComments.$inferSelect;
export type InsertStrainReviewComment = typeof strainReviewComments.$inferInsert;

// ─────────────────────────────────────────────
// ADMIN MESSAGES — Direct popup messages from admin to users
// userId null = broadcast to all users
// ─────────────────────────────────────────────
export const adminMessages = mysqlTable("admin_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null = broadcast to all
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "promo", "alert"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adminMessageSeen = mysqlTable("admin_message_seen", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  seenAt: timestamp("seenAt").defaultNow().notNull(),
});

export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = typeof adminMessages.$inferInsert;

export const adminMessageReplies = mysqlTable("admin_message_replies", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  reply: text("reply").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// LIVE CHAT — Two-way admin ↔ user messaging
// ─────────────────────────────────────────────
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),                    // null for anonymous users
  sessionId: varchar("sessionId", { length: 64 }), // anonymous browser session UUID
  displayName: varchar("displayName", { length: 255 }), // name shown in admin panel
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  adminUnread: int("adminUnread").default(0).notNull(),   // unread count for admin
  userUnread: int("userUnread").default(0).notNull(),     // unread count for user
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Stealth admin-initiated chat
  status: mysqlEnum("chatStatus", ["open", "closed"]).default("open").notNull(),
  adminInitiated: boolean("adminInitiated").default(false).notNull(),
  closedAt: timestamp("closedAt"),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderRole: mysqlEnum("senderRole", ["admin", "user"]).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
