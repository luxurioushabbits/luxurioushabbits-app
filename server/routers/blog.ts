/**
 * Blog Router — Admin-managed blog articles
 * Public: list published posts, get single post by slug
 * Admin: create, update, delete, publish/unpublish
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 200);
}

export const blogRouter = router({
  // ── PUBLIC ──────────────────────────────────────────────────────────────

  /** List published blog posts with optional search/category filter */
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { posts: [], total: 0 };

      const conditions = [eq(blogPosts.isPublished, true)];
      if (input?.category) conditions.push(eq(blogPosts.category, input.category));
      if (input?.search) {
        const s = `%${input.search}%`;
        const searchCond = or(like(blogPosts.title, s), like(blogPosts.excerpt, s), like(blogPosts.content, s));
        if (searchCond) conditions.push(searchCond);
      }

      const result = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          category: blogPosts.category,
          tags: blogPosts.tags,
          coverImage: blogPosts.coverImage,
          authorName: blogPosts.authorName,
          readTimeMinutes: blogPosts.readTimeMinutes,
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt,
        })
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      return { posts: result, total: result.length };
    }),

  /** Get a single published post by slug */
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.isPublished, true)))
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      return post;
    }),

  // ── ADMIN ────────────────────────────────────────────────────────────────

  /** Admin: list ALL posts (published + drafts) */
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.updatedAt));
  }),

  /** Admin: create a new blog post */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(500),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(10),
        category: z.string().default("General"),
        tags: z.array(z.string()).default([]),
        coverImage: z.string().url().optional().or(z.literal("")),
        authorName: z.string().default("Luxurious Habbits"),
        metaTitle: z.string().max(500).optional(),
        metaDescription: z.string().max(500).optional(),
        readTimeMinutes: z.number().int().min(1).default(5),
        isPublished: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const baseSlug = slugify(input.title);
      // Ensure slug uniqueness
      let slug = baseSlug;
      const existing = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(like(blogPosts.slug, `${baseSlug}%`));
      if (existing.length > 0) {
        slug = `${baseSlug}-${Date.now()}`;
      }

      const [result] = await db.insert(blogPosts).values({
        slug,
        title: input.title,
        excerpt: input.excerpt ?? null,
        content: input.content,
        category: input.category,
        tags: JSON.stringify(input.tags),
        coverImage: input.coverImage || null,
        authorName: input.authorName,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        readTimeMinutes: input.readTimeMinutes,
        isPublished: input.isPublished,
        publishedAt: input.isPublished ? new Date() : null,
      });

      return { id: (result as any).insertId, slug };
    }),

  /** Admin: update an existing blog post */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(3).max(500).optional(),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(10).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        coverImage: z.string().optional(),
        authorName: z.string().optional(),
        metaTitle: z.string().max(500).optional(),
        metaDescription: z.string().max(500).optional(),
        readTimeMinutes: z.number().int().min(1).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { id, tags, isPublished, ...rest } = input;

      // Fetch current to check publish state change
      const [current] = await db.select({ isPublished: blogPosts.isPublished, publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: Record<string, unknown> = { ...rest };
      if (tags !== undefined) updates.tags = JSON.stringify(tags);
      if (isPublished !== undefined) {
        updates.isPublished = isPublished;
        if (isPublished && !current.isPublished) {
          updates.publishedAt = new Date();
        }
      }

      await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  /** Admin: delete a blog post */
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),
});
