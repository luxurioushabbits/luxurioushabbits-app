/**
 * Site Analytics Router — Admin-only procedures for dashboard data
 * Covers: page views, active visitors, cart stats, order funnel, revenue, top pages
 */
import { TRPCError } from "@trpc/server";
import { and, count, desc, gte, sql, ne } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  pageViews,
  activeSessions,
  abandonedCarts,
  orders,
  users,
} from "../../drizzle/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const siteAnalyticsRouter = router({
  /** Real-time: sessions with heartbeat in last 2 minutes */
  activeVisitors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0, sessions: [] };

    // Clean stale sessions older than 5 minutes first
    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);
    try {
      // We can't easily delete with drizzle timestamp comparison, use raw sql
      await db.execute(
        sql`DELETE FROM active_sessions WHERE lastSeen < ${staleThreshold}`
      );
    } catch { /* non-fatal */ }

    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    const rows = await db
      .select()
      .from(activeSessions)
      .where(gte(activeSessions.lastSeen, twoMinAgo));

    return {
      count: rows.length,
      sessions: rows.map(r => ({
        sessionId: r.sessionId,
        path: r.path,
        lastSeen: r.lastSeen,
        userId: r.userId ?? null,
        userName: r.userName ?? null,
        walletAddress: r.walletAddress ?? null,
        ipAddress: r.ipAddress ?? null,
        city: r.city ?? null,
        region: r.region ?? null,
        country: r.country ?? null,
        deviceType: r.deviceType ?? "desktop",
        firstSeen: r.firstSeen ?? r.lastSeen,
        isAdmin: r.isAdmin ?? false,
      })),
    };
  }),

  /** Visitor counts: today, last 7 days, last 30 days (unique sessions) */
  visitorStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { today: 0, week: 0, month: 0, totalPageViews: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayRows, weekRows, monthRows, totalRows] = await Promise.all([
      db.execute(
        sql`SELECT COUNT(DISTINCT sessionId) as cnt FROM page_views WHERE createdAt >= ${todayStart}`
      ),
      db.execute(
        sql`SELECT COUNT(DISTINCT sessionId) as cnt FROM page_views WHERE createdAt >= ${daysAgo(7)}`
      ),
      db.execute(
        sql`SELECT COUNT(DISTINCT sessionId) as cnt FROM page_views WHERE createdAt >= ${daysAgo(30)}`
      ),
      db.execute(
        sql`SELECT COUNT(*) as cnt FROM page_views`
      ),
    ]);

    const extract = (rows: any) => {
      const r = Array.isArray(rows) ? rows[0] : (rows as any).rows?.[0];
      return Number(r?.cnt ?? 0);
    };

    return {
      today: extract(todayRows),
      week: extract(weekRows),
      month: extract(monthRows),
      totalPageViews: extract(totalRows),
    };
  }),

  /** Daily visitor chart — unique sessions per day for last N days */
  dailyVisitors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT
          DATE(createdAt) as date,
          COUNT(DISTINCT sessionId) as visitors,
          COUNT(*) as pageViews
        FROM page_views
        WHERE createdAt >= ${daysAgo(30)}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      date: String(r.date),
      visitors: Number(r.visitors),
      pageViews: Number(r.pageViews),
    }));
  }),

  /** Top pages by view count (last 30 days) */
  topPages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT
          path,
          COUNT(*) as views,
          COUNT(DISTINCT sessionId) as uniqueVisitors
        FROM page_views
        WHERE createdAt >= ${daysAgo(30)}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 20
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      path: String(r.path),
      views: Number(r.views),
      uniqueVisitors: Number(r.uniqueVisitors),
    }));
  }),

  /** Active carts: carts with items that haven't converted to orders */
  activeCartsStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, withEmail: 0, totalValue: 0 };

    const rows = await db.execute(
      sql`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as withEmail,
          COALESCE(SUM(totalCents), 0) as totalValue
        FROM abandoned_carts
        WHERE recoveredAt IS NULL
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    const r = data[0] ?? {};
    return {
      total: Number(r.total ?? 0),
      withEmail: Number(r.withEmail ?? 0),
      totalValue: Number(r.totalValue ?? 0),
    };
  }),

  /** Order funnel: counts by status */
  orderFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT status, COUNT(*) as cnt
        FROM orders
        GROUP BY status
        ORDER BY cnt DESC
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      status: String(r.status),
      count: Number(r.cnt),
    }));
  }),

  /** Revenue stats: today, this week, this month, all time */
  revenueStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { today: 0, week: 0, month: 0, allTime: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const rows = await db.execute(
      sql`
        SELECT
          COALESCE(SUM(CASE WHEN createdAt >= ${todayStart} THEN total ELSE 0 END), 0) as today,
          COALESCE(SUM(CASE WHEN createdAt >= ${daysAgo(7)} THEN total ELSE 0 END), 0) as week,
          COALESCE(SUM(CASE WHEN createdAt >= ${daysAgo(30)} THEN total ELSE 0 END), 0) as month,
          COALESCE(SUM(total), 0) as allTime
        FROM orders
        WHERE status != 'cancelled'
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    const r = data[0] ?? {};
    return {
      today: Number(r.today ?? 0),
      week: Number(r.week ?? 0),
      month: Number(r.month ?? 0),
      allTime: Number(r.allTime ?? 0),
    };
  }),

  /** Top referrers (last 30 days) */
  topReferrers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT
          COALESCE(referrer, '(direct)') as referrer,
          COUNT(*) as visits,
          COUNT(DISTINCT sessionId) as sessions
        FROM page_views
        WHERE createdAt >= ${daysAgo(30)}
        GROUP BY referrer
        ORDER BY visits DESC
        LIMIT 15
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      referrer: String(r.referrer ?? '(direct)'),
      visits: Number(r.visits),
      sessions: Number(r.sessions),
    }));
  }),

  /** New user registrations over time */
  newUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { today: 0, week: 0, month: 0, allTime: 0, daily: [] };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [summaryRows, dailyRows] = await Promise.all([
      db.execute(
        sql`
          SELECT
            SUM(CASE WHEN createdAt >= ${todayStart} THEN 1 ELSE 0 END) as today,
            SUM(CASE WHEN createdAt >= ${daysAgo(7)} THEN 1 ELSE 0 END) as week,
            SUM(CASE WHEN createdAt >= ${daysAgo(30)} THEN 1 ELSE 0 END) as month,
            COUNT(*) as allTime
          FROM users
        `
      ),
      db.execute(
        sql`
          SELECT DATE(createdAt) as date, COUNT(*) as count
          FROM users
          WHERE createdAt >= ${daysAgo(30)}
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
        `
      ),
    ]);

    const s = (Array.isArray(summaryRows) ? summaryRows : (summaryRows as any).rows ?? [])[0] ?? {};
    const d = Array.isArray(dailyRows) ? dailyRows : (dailyRows as any).rows ?? [];
    return {
      today: Number(s.today ?? 0),
      week: Number(s.week ?? 0),
      month: Number(s.month ?? 0),
      allTime: Number(s.allTime ?? 0),
      daily: d.map((r: any) => ({ date: String(r.date), count: Number(r.count) })),
    };
  }),

  /** Hourly traffic heatmap — last 7 days, grouped by hour of day */
  hourlyTraffic: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT
          HOUR(createdAt) as hour,
          COUNT(*) as views,
          COUNT(DISTINCT sessionId) as visitors
        FROM page_views
        WHERE createdAt >= ${daysAgo(7)}
        GROUP BY HOUR(createdAt)
        ORDER BY hour ASC
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      hour: Number(r.hour),
      views: Number(r.views),
      visitors: Number(r.visitors),
    }));
  }),

  /** Daily revenue chart — last 30 days */
  dailyRevenue: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`
        SELECT
          DATE(createdAt) as date,
          COUNT(*) as orderCount,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE createdAt >= ${daysAgo(30)} AND status != 'cancelled'
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
    );

    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      date: String(r.date),
      orderCount: Number(r.orderCount),
      revenue: Number(r.revenue),
    }));
  }),

  /** Conversion rate: unique sessions vs orders in last 30 days */
  conversionRate: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { rate: 0, sessions: 0, orders: 0 };
    const [sessRows, ordRows] = await Promise.all([
      db.execute(sql`SELECT COUNT(DISTINCT sessionId) as cnt FROM page_views WHERE createdAt >= ${daysAgo(30)}`),
      db.execute(sql`SELECT COUNT(*) as cnt FROM orders WHERE createdAt >= ${daysAgo(30)} AND status != 'cancelled'`),
    ]);
    const sessData = Array.isArray(sessRows) ? sessRows : (sessRows as any).rows ?? [];
    const ordData = Array.isArray(ordRows) ? ordRows : (ordRows as any).rows ?? [];
    const sessions = Number(sessData[0]?.cnt ?? 0);
    const orderCount = Number(ordData[0]?.cnt ?? 0);
    return {
      rate: sessions > 0 ? Math.round((orderCount / sessions) * 10000) / 100 : 0,
      sessions,
      orders: orderCount,
    };
  }),

  /** Cart abandonment rate: carts created vs orders placed last 30 days */
  cartAbandonmentRate: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { rate: 0, carts: 0, converted: 0 };
    const [cartRows, ordRows] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as cnt FROM abandoned_carts WHERE createdAt >= ${daysAgo(30)}`),
      db.execute(sql`SELECT COUNT(*) as cnt FROM orders WHERE createdAt >= ${daysAgo(30)} AND status != 'cancelled'`),
    ]);
    const cartData = Array.isArray(cartRows) ? cartRows : (cartRows as any).rows ?? [];
    const ordData = Array.isArray(ordRows) ? ordRows : (ordRows as any).rows ?? [];
    const carts = Number(cartData[0]?.cnt ?? 0);
    const orderCount = Number(ordData[0]?.cnt ?? 0);
    const total = carts + orderCount;
    return {
      rate: total > 0 ? Math.round(((carts) / total) * 10000) / 100 : 0,
      carts,
      converted: orderCount,
    };
  }),

  /** Top exit pages — pages with most sessions that ended there (last 30 days) */
  topExitPages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.execute(
      sql`
        SELECT path, COUNT(*) as exits
        FROM page_views
        WHERE createdAt >= ${daysAgo(30)}
        GROUP BY path
        ORDER BY exits DESC
        LIMIT 10
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({ path: String(r.path), exits: Number(r.exits) }));
  }),

  /** Repeat customer rate: % of orders from users with >1 order */
  repeatCustomerRate: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { rate: 0, repeat: 0, firstTime: 0 };
    const rows = await db.execute(
      sql`
        SELECT
          SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) as repeat_customers,
          SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) as first_time_customers
        FROM (
          SELECT userId, COUNT(*) as order_count
          FROM orders
          WHERE status != 'cancelled' AND userId IS NOT NULL
          GROUP BY userId
        ) t
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    const repeat = Number(data[0]?.repeat_customers ?? 0);
    const firstTime = Number(data[0]?.first_time_customers ?? 0);
    const total = repeat + firstTime;
    return {
      rate: total > 0 ? Math.round((repeat / total) * 10000) / 100 : 0,
      repeat,
      firstTime,
    };
  }),

  /** Visitor location breakdown by state (from active_sessions geo data, last 30 days) */
  locationBreakdown: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.execute(
      sql`
        SELECT
          region as state,
          country,
          COUNT(DISTINCT sessionId) as visitors
        FROM active_sessions
        WHERE lastSeen >= ${daysAgo(30)} AND region IS NOT NULL AND region != ''
        GROUP BY region, country
        ORDER BY visitors DESC
        LIMIT 20
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({
      state: String(r.state),
      country: String(r.country ?? ""),
      visitors: Number(r.visitors),
    }));
  }),

  /** New vs returning visitors last 30 days */
  newVsReturning: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { newVisitors: 0, returning: 0 };
    const rows = await db.execute(
      sql`
        SELECT
          SUM(CASE WHEN visit_count = 1 THEN 1 ELSE 0 END) as new_visitors,
          SUM(CASE WHEN visit_count > 1 THEN 1 ELSE 0 END) as returning_visitors
        FROM (
          SELECT sessionId, COUNT(*) as visit_count
          FROM page_views
          WHERE createdAt >= ${daysAgo(30)}
          GROUP BY sessionId
        ) t
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return {
      newVisitors: Number(data[0]?.new_visitors ?? 0),
      returning: Number(data[0]?.returning_visitors ?? 0),
    };
  }),

  /** Average session duration from active_sessions (firstSeen → lastSeen) last 7 days */
  avgSessionDuration: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { avgSeconds: 0 };
    const rows = await db.execute(
      sql`
        SELECT AVG(TIMESTAMPDIFF(SECOND, firstSeen, lastSeen)) as avg_seconds
        FROM active_sessions
        WHERE lastSeen >= ${daysAgo(7)} AND firstSeen IS NOT NULL
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return { avgSeconds: Math.round(Number(data[0]?.avg_seconds ?? 0)) };
  }),

  /** Device breakdown from active_sessions last 30 days */
  deviceBreakdown: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.execute(
      sql`
        SELECT deviceType, COUNT(DISTINCT sessionId) as visitors
        FROM active_sessions
        WHERE lastSeen >= ${daysAgo(30)} AND deviceType IS NOT NULL
        GROUP BY deviceType
        ORDER BY visitors DESC
      `
    );
    const data = Array.isArray(rows) ? rows : (rows as any).rows ?? [];
    return data.map((r: any) => ({ device: String(r.deviceType), visitors: Number(r.visitors) }));
  }),
});
