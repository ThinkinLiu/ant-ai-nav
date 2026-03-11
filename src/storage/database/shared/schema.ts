import { pgTable, index, unique, serial, varchar, text, jsonb, integer, boolean, timestamp, foreignKey, check, uuid, date, bigint, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const aiTools = pgTable("ai_tools", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	longDescription: text("long_description"),
	website: varchar({ length: 500 }).notNull(),
	logo: text(),
	screenshots: jsonb(),
	categoryId: integer("category_id").notNull(),
	publisherId: varchar("publisher_id", { length: 36 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	isFeatured: boolean("is_featured").default(false),
	isFree: boolean("is_free").default(true),
	pricingInfo: text("pricing_info"),
	viewCount: integer("view_count").default(0),
	favoriteCount: integer("favorite_count").default(0),
	rejectReason: text("reject_reason"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	isPinned: boolean("is_pinned").default(false),
}, (table) => [
	index("ai_tools_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("ai_tools_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("ai_tools_publisher_id_idx").using("btree", table.publisherId.asc().nullsLast().op("text_ops")),
	index("ai_tools_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("ai_tools_status_category_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.categoryId.asc().nullsLast().op("int4_ops")),
	index("ai_tools_status_created_at_idx").using("btree", table.status.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("ai_tools_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("ai_tools_status_view_count_idx").using("btree", table.status.asc().nullsLast().op("int4_ops"), table.viewCount.desc().nullsFirst().op("text_ops")),
	index("idx_ai_tools_is_pinned").using("btree", table.isPinned.asc().nullsLast().op("bool_ops")),
	unique("ai_tools_slug_unique").on(table.slug),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const favorites = pgTable("favorites", {
	id: serial().primaryKey().notNull(),
	toolId: integer("tool_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("favorites_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("favorites_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const tags = pgTable("tags", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tags_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("tags_slug_unique").on(table.slug),
]);

export const toolTags = pgTable("tool_tags", {
	id: serial().primaryKey().notNull(),
	toolId: integer("tool_id").notNull(),
	tagId: integer("tag_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tool_tags_tag_id_idx").using("btree", table.tagId.asc().nullsLast().op("int4_ops")),
	index("tool_tags_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 128 }),
	avatar: text(),
	role: varchar({ length: 20 }).default('user').notNull(),
	bio: text(),
	website: varchar({ length: 500 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
]);

export const publisherApplications = pgTable("publisher_applications", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	reason: text().notNull(),
	contact: varchar({ length: 255 }),
	website: varchar({ length: 500 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	reviewedBy: varchar("reviewed_by", { length: 255 }),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	reviewNote: text("review_note"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_publisher_applications_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_publisher_applications_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "publisher_applications_reviewed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "publisher_applications_user_id_fkey"
		}).onDelete("cascade"),
	check("publisher_applications_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])`),
]);

export const comments = pgTable("comments", {
	id: serial().primaryKey().notNull(),
	toolId: integer("tool_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	content: text().notNull(),
	rating: integer(),
	parentId: integer("parent_id"),
	isHidden: boolean("is_hidden").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	isFeatured: boolean("is_featured").default(false),
}, (table) => [
	index("comments_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("comments_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("comments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("idx_comments_is_featured").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	icon: varchar({ length: 100 }),
	color: varchar({ length: 20 }),
	parentId: integer("parent_id"),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("categories_slug_unique").on(table.slug),
]);

export const rankingUpdateLog = pgTable("ranking_update_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	updateDate: date("update_date").notNull(),
	status: varchar({ length: 20 }).default('pending'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("ranking_update_log_update_date_key").on(table.updateDate),
]);

export const aiToolRankings = pgTable("ai_tool_rankings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	toolId: integer("tool_id").notNull(),
	rank: integer().notNull(),
	previousRank: integer("previous_rank"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	monthlyVisits: bigint("monthly_visits", { mode: "number" }),
	monthlyVisitsChange: numeric("monthly_visits_change", { precision: 10, scale:  2 }),
	categoryRank: integer("category_rank"),
	categoryId: integer("category_id"),
	rankingDate: date("ranking_date").default(sql`CURRENT_DATE`).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_tool_rankings_rank").using("btree", table.rank.asc().nullsLast().op("int4_ops")),
	index("idx_ai_tool_rankings_ranking_date").using("btree", table.rankingDate.asc().nullsLast().op("date_ops")),
	index("idx_ai_tool_rankings_tool_id").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [aiTools.id],
			name: "ai_tool_rankings_tool_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "ai_tool_rankings_category_id_fkey"
		}),
	unique("ai_tool_rankings_tool_id_ranking_date_key").on(table.toolId, table.rankingDate),
]);

// SEO配置表
export const seoSettings = pgTable("seo_settings", {
	id: serial().primaryKey().notNull(),
	// 网站基本信息
	siteName: varchar("site_name", { length: 200 }).default('蚂蚁AI导航'),
	siteDescription: text("site_description"),
	siteKeywords: text("site_keywords"),
	siteUrl: varchar("site_url", { length: 500 }),
	
	// Open Graph
	ogTitle: varchar("og_title", { length: 200 }),
	ogDescription: text("og_description"),
	ogImage: text("og_image"),
	ogType: varchar("og_type", { length: 50 }).default('website'),
	
	// Twitter Card
	twitterCard: varchar("twitter_card", { length: 50 }).default('summary_large_image'),
	twitterSite: varchar("twitter_site", { length: 100 }),
	twitterCreator: varchar("twitter_creator", { length: 100 }),
	
	// 结构化数据
	structuredData: jsonb("structured_data"),
	
	// 其他SEO设置
	robotsTxt: text("robots_txt"),
	googleSiteVerification: varchar("google_site_verification", { length: 200 }),
	baiduSiteVerification: varchar("baidu_site_verification", { length: 200 }),
	
	// 统计代码
	googleAnalyticsId: varchar("google_analytics_id", { length: 100 }),
	baiduAnalyticsId: varchar("baidu_analytics_id", { length: 100 }),
	customHeadScripts: text("custom_head_scripts"),
	customBodyScripts: text("custom_body_scripts"),
	
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 流量数据源配置表
export const trafficDataSources = pgTable("traffic_data_sources", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),           // 数据源名称 (similarweb, semrush, etc.)
	displayName: varchar("display_name", { length: 200 }), // 显示名称
	apiKey: varchar("api_key", { length: 500 }),        // API密钥
	apiEndpoint: varchar("api_endpoint", { length: 500 }), // API端点
	isActive: boolean("is_active").default(false),      // 是否启用
	priority: integer().default(0),                     // 优先级（数字越大优先级越高）
	config: jsonb(),                                    // 额外配置
	lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: 'string' }),
	syncStatus: varchar("sync_status", { length: 20 }), // pending, success, failed
	syncError: text("sync_error"),                      // 同步错误信息
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
