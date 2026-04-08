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
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_favorites_user_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [aiTools.id],
			name: "fk_favorites_tool_id"
		}).onDelete("cascade"),
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
	phone: varchar({ length: 20 }),
}, (table) => [
	index("idx_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
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

export const smtpSettings = pgTable("smtp_settings", {
	id: serial().primaryKey().notNull(),
	host: varchar({ length: 255 }).notNull(),
	port: integer().default(587).notNull(),
	secure: boolean().default(true),
	userName: varchar("user_name", { length: 255 }).notNull(),
	password: text().notNull(),
	fromEmail: varchar("from_email", { length: 255 }).notNull(),
	fromName: varchar("from_name", { length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

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

export const aiHallOfFame = pgTable("ai_hall_of_fame", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	nameEn: varchar("name_en", { length: 100 }),
	photo: text(),
	title: varchar({ length: 200 }),
	summary: text().notNull(),
	bio: text(),
	achievements: jsonb(),
	organization: varchar({ length: 200 }),
	organizationUrl: varchar("organization_url", { length: 500 }),
	country: varchar({ length: 50 }),
	category: varchar({ length: 50 }),
	tags: jsonb(),
	isFeatured: boolean("is_featured").default(false),
	viewCount: integer("view_count").default(0),
	birthYear: integer("birth_year"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	deathYear: integer("death_year"),
}, (table) => [
	index("ai_hall_of_fame_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("ai_hall_of_fame_is_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("ai_hall_of_fame_view_count_idx").using("btree", table.viewCount.asc().nullsLast().op("int4_ops")),
]);

export const emailVerificationCodes = pgTable("email_verification_codes", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 6 }).notNull(),
	type: varchar({ length: 20 }).default('register').notNull(),
	isUsed: boolean("is_used").default(false),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_email_verification_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("idx_email_verification_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_email_verification_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
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

export const aiTimeline = pgTable("ai_timeline", {
	id: serial().primaryKey().notNull(),
	year: integer().notNull(),
	month: integer(),
	day: integer(),
	title: varchar({ length: 200 }).notNull(),
	titleEn: varchar("title_en", { length: 200 }),
	description: text().notNull(),
	category: varchar({ length: 50 }),
	importance: varchar({ length: 20 }).default('normal'),
	icon: varchar({ length: 50 }),
	image: text(),
	relatedPersonId: integer("related_person_id"),
	relatedUrl: varchar("related_url", { length: 500 }),
	tags: jsonb(),
	viewCount: integer("view_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ai_timeline_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("ai_timeline_importance_idx").using("btree", table.importance.asc().nullsLast().op("text_ops")),
	index("ai_timeline_year_idx").using("btree", table.year.desc().nullsFirst().op("int4_ops")),
	foreignKey({
			columns: [table.relatedPersonId],
			foreignColumns: [aiHallOfFame.id],
			name: "ai_timeline_related_person_id_fkey"
		}),
]);

export const friendLinks = pgTable("friend_links", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	url: varchar({ length: 500 }).notNull(),
	description: text(),
	logo: varchar({ length: 500 }),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactName: varchar("contact_name", { length: 100 }),
	status: varchar({ length: 20 }).default('pending'),
	submitterIp: varchar("submitter_ip", { length: 50 }),
	rejectReason: text("reject_reason"),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_friend_links_sort").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	index("idx_friend_links_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("friend_links_url_key").on(table.url),
	check("friend_links_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])`),
]);

export const seoSettings = pgTable("seo_settings", {
	id: serial().primaryKey().notNull(),
	siteName: varchar("site_name", { length: 200 }).default('蚂蚁AI导航'),
	siteDescription: text("site_description"),
	siteKeywords: text("site_keywords"),
	siteUrl: varchar("site_url", { length: 500 }),
	blogLogo: text("blog_logo"),
	blogName: varchar("blog_name", { length: 200 }).default('蚂蚁AI之家'),
	blogDescription: text("blog_description").default('探索AI技术的无限可能，掌握前沿AI工具的使用技巧'),
	blogUrl: varchar("blog_url", { length: 500 }),
	ogTitle: varchar("og_title", { length: 200 }),
	ogDescription: text("og_description"),
	ogImage: text("og_image"),
	ogType: varchar("og_type", { length: 50 }).default('website'),
	twitterCard: varchar("twitter_card", { length: 50 }).default('summary_large_image'),
	twitterSite: varchar("twitter_site", { length: 100 }),
	twitterCreator: varchar("twitter_creator", { length: 100 }),
	structuredData: jsonb("structured_data"),
	robotsTxt: text("robots_txt"),
	googleSiteVerification: varchar("google_site_verification", { length: 200 }),
	baiduSiteVerification: varchar("baidu_site_verification", { length: 200 }),
	googleAnalyticsId: varchar("google_analytics_id", { length: 100 }),
	baiduAnalyticsId: varchar("baidu_analytics_id", { length: 100 }),
	customHeadScripts: text("custom_head_scripts"),
	customBodyScripts: text("custom_body_scripts"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	laAnalyticsId: varchar("la_analytics_id", { length: 50 }),
});

export const trafficDataSources = pgTable("traffic_data_sources", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 200 }),
	apiKey: varchar("api_key", { length: 500 }),
	apiEndpoint: varchar("api_endpoint", { length: 500 }),
	isActive: boolean("is_active").default(false),
	priority: integer().default(0),
	config: jsonb(),
	lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: 'string' }),
	syncStatus: varchar("sync_status", { length: 20 }),
	syncError: text("sync_error"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const aiNews = pgTable("ai_news", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 300 }).notNull(),
	titleEn: varchar("title_en", { length: 300 }),
	summary: text().notNull(),
	content: text(),
	source: varchar({ length: 100 }),
	sourceUrl: varchar("source_url", { length: 500 }),
	author: varchar({ length: 100 }),
	category: varchar({ length: 50 }),
	tags: jsonb(),
	coverImage: text("cover_image"),
	isFeatured: boolean("is_featured").default(false),
	isHot: boolean("is_hot").default(false),
	viewCount: integer("view_count").default(0),
	likeCount: integer("like_count").default(0),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	authorId: varchar("author_id", { length: 36 }),
	slug: varchar({ length: 255 }),
	status: varchar({ length: 20 }).default('draft'),
	rejectReason: text("reject_reason"),
}, (table) => [
	index("ai_news_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("ai_news_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("ai_news_is_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("ai_news_is_hot_idx").using("btree", table.isHot.asc().nullsLast().op("bool_ops")),
	index("ai_news_published_at_idx").using("btree", table.publishedAt.desc().nullsFirst().op("timestamptz_ops")),
	index("ai_news_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("ai_news_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const siteSettings = pgTable("site_settings", {
	id: serial().primaryKey().notNull(),
	rankingEnabled: boolean("ranking_enabled").default(true),
	rankingTitle: varchar("ranking_title", { length: 100 }).default('AI工具排行榜'),
	rankingDescription: text("ranking_description"),
	commentsEnabled: boolean("comments_enabled").default(true),
	favoritesEnabled: boolean("favorites_enabled").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const oauthSettings = pgTable("oauth_settings", {
	id: serial().primaryKey().notNull(),
	provider: varchar({ length: 20 }).notNull(),
	appId: varchar("app_id", { length: 100 }).notNull(),
	appSecret: text("app_secret").notNull(),
	isEnabled: boolean("is_enabled").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("oauth_settings_provider_key").on(table.provider),
]);

export const newsCategories = pgTable("news_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	description: text(),
	icon: varchar({ length: 10 }),
	color: varchar({ length: 20 }),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("news_categories_slug_key").on(table.slug),
]);

export const announcements = pgTable("announcements", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text(),
	linkUrl: varchar("link_url", { length: 500 }),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	expireAt: timestamp("expire_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const homeTabs = pgTable("home_tabs", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	sourceId: integer("source_id"),
	icon: varchar({ length: 50 }),
	color: varchar({ length: 20 }),
	sortOrder: integer("sort_order").default(0),
	isDefault: boolean("is_default").default(false),
	isSystem: boolean("is_system").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	isVisible: boolean("is_visible").default(true),
}, (table) => [
	unique("home_tabs_slug_key").on(table.slug),
]);

export const userOauthAccounts = pgTable("user_oauth_accounts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	provider: varchar({ length: 20 }).notNull(),
	providerUserId: varchar("provider_user_id", { length: 100 }).notNull(),
	providerData: jsonb("provider_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_oauth_accounts_provider").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerUserId.asc().nullsLast().op("text_ops")),
	index("idx_user_oauth_accounts_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_oauth_accounts_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_oauth_accounts_user_id_provider_key").on(table.userId, table.provider),
	unique("user_oauth_accounts_provider_provider_user_id_key").on(table.provider, table.providerUserId),
]);

export const smsSettings = pgTable("sms_settings", {
	id: serial().primaryKey().notNull(),
	provider: varchar({ length: 20 }).notNull(),
	accessKeyId: text("access_key_id"),
	accessKeySecret: text("access_key_secret"),
	signName: varchar("sign_name", { length: 50 }),
	templateCode: varchar("template_code", { length: 50 }),
	isEnabled: boolean("is_enabled").default(false),
	apiUrl: text("api_url"),
	extraConfig: jsonb("extra_config"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const smsVerificationCodes = pgTable("sms_verification_codes", {
	id: serial().primaryKey().notNull(),
	phone: varchar({ length: 20 }).notNull(),
	code: varchar({ length: 6 }).notNull(),
	type: varchar({ length: 20 }).default('login').notNull(),
	isUsed: boolean("is_used").default(false),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_sms_codes_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("idx_sms_codes_phone_code").using("btree", table.phone.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("text_ops")),
]);

export const newsTags = pgTable("news_tags", {
	id: serial().primaryKey().notNull(),
	newsId: integer("news_id").notNull(),
	tagId: integer("tag_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_news_tags_news_id").using("btree", table.newsId.asc().nullsLast().op("int4_ops")),
	index("idx_news_tags_tag_id").using("btree", table.tagId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.newsId],
			foreignColumns: [aiNews.id],
			name: "news_tags_news_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "news_tags_tag_id_fkey"
		}).onDelete("cascade"),
	unique("news_tags_news_id_tag_id_key").on(table.newsId, table.tagId),
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
