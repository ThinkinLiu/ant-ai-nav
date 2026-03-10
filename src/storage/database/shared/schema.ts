import { pgTable, serial, timestamp, varchar, text, boolean, integer, index, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 系统表（必须保留）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表（与 Supabase Auth 关联）
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // Supabase Auth User ID
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 128 }),
    avatar: text("avatar"),
    role: varchar("role", { length: 20 }).notNull().default("user"), // user, publisher, admin
    bio: text("bio"),
    website: varchar("website", { length: 500 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
);

// 分类表
export const categories = pgTable(
  "categories",
  {
    id: serial().notNull().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 100 }),
    color: varchar("color", { length: 20 }),
    parentId: integer("parent_id"),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("categories_slug_idx").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
  ]
);

// 标签表
export const tags = pgTable(
  "tags",
  {
    id: serial().notNull().primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tags_slug_idx").on(table.slug),
  ]
);

// AI工具表
export const aiTools = pgTable(
  "ai_tools",
  {
    id: serial().notNull().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    description: text("description").notNull(),
    longDescription: text("long_description"),
    website: varchar("website", { length: 500 }).notNull(),
    logo: text("logo"),
    screenshots: jsonb("screenshots").$type<string[]>(),
    categoryId: integer("category_id").notNull(),
    publisherId: varchar("publisher_id", { length: 36 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
    isFeatured: boolean("is_featured").default(false),
    isFree: boolean("is_free").default(true),
    pricingInfo: text("pricing_info"),
    viewCount: integer("view_count").default(0),
    favoriteCount: integer("favorite_count").default(0),
    rejectReason: text("reject_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("ai_tools_slug_idx").on(table.slug),
    index("ai_tools_category_id_idx").on(table.categoryId),
    index("ai_tools_publisher_id_idx").on(table.publisherId),
    index("ai_tools_status_idx").on(table.status),
    index("ai_tools_created_at_idx").on(table.createdAt),
  ]
);

// 工具标签关联表
export const toolTags = pgTable(
  "tool_tags",
  {
    id: serial().notNull().primaryKey(),
    toolId: integer("tool_id").notNull(),
    tagId: integer("tag_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tool_tags_tool_id_idx").on(table.toolId),
    index("tool_tags_tag_id_idx").on(table.tagId),
  ]
);

// 评论表
export const comments = pgTable(
  "comments",
  {
    id: serial().notNull().primaryKey(),
    toolId: integer("tool_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    rating: integer("rating"), // 1-5 星评分
    parentId: integer("parent_id"), // 回复评论
    isHidden: boolean("is_hidden").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("comments_tool_id_idx").on(table.toolId),
    index("comments_user_id_idx").on(table.userId),
    index("comments_parent_id_idx").on(table.parentId),
  ]
);

// 收藏表
export const favorites = pgTable(
  "favorites",
  {
    id: serial().notNull().primaryKey(),
    toolId: integer("tool_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("favorites_tool_id_idx").on(table.toolId),
    index("favorites_user_id_idx").on(table.userId),
  ]
);

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  name: true,
  avatar: true,
  role: true,
  bio: true,
  website: true,
});

export const insertCategorySchema = createCoercedInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  icon: true,
  color: true,
  parentId: true,
  sortOrder: true,
});

export const insertTagSchema = createCoercedInsertSchema(tags).pick({
  name: true,
  slug: true,
});

export const insertAiToolSchema = createCoercedInsertSchema(aiTools).pick({
  name: true,
  slug: true,
  description: true,
  longDescription: true,
  website: true,
  logo: true,
  screenshots: true,
  categoryId: true,
  publisherId: true,
  isFree: true,
  pricingInfo: true,
});

export const insertCommentSchema = createCoercedInsertSchema(comments).pick({
  toolId: true,
  userId: true,
  content: true,
  rating: true,
  parentId: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type AiTool = typeof aiTools.$inferSelect;
export type ToolTag = typeof toolTags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
