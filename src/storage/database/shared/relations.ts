import { relations } from "drizzle-orm/relations";
import { users, favorites, aiTools, publisherApplications, aiToolRankings, categories, aiHallOfFame, aiTimeline, userOauthAccounts, aiNews, newsTags, tags } from "./schema";

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	aiTool: one(aiTools, {
		fields: [favorites.toolId],
		references: [aiTools.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	favorites: many(favorites),
	publisherApplications_reviewedBy: many(publisherApplications, {
		relationName: "publisherApplications_reviewedBy_users_id"
	}),
	publisherApplications_userId: many(publisherApplications, {
		relationName: "publisherApplications_userId_users_id"
	}),
	userOauthAccounts: many(userOauthAccounts),
}));

export const aiToolsRelations = relations(aiTools, ({many}) => ({
	favorites: many(favorites),
	aiToolRankings: many(aiToolRankings),
}));

export const publisherApplicationsRelations = relations(publisherApplications, ({one}) => ({
	user_reviewedBy: one(users, {
		fields: [publisherApplications.reviewedBy],
		references: [users.id],
		relationName: "publisherApplications_reviewedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [publisherApplications.userId],
		references: [users.id],
		relationName: "publisherApplications_userId_users_id"
	}),
}));

export const aiToolRankingsRelations = relations(aiToolRankings, ({one}) => ({
	aiTool: one(aiTools, {
		fields: [aiToolRankings.toolId],
		references: [aiTools.id]
	}),
	category: one(categories, {
		fields: [aiToolRankings.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	aiToolRankings: many(aiToolRankings),
}));

export const aiTimelineRelations = relations(aiTimeline, ({one}) => ({
	aiHallOfFame: one(aiHallOfFame, {
		fields: [aiTimeline.relatedPersonId],
		references: [aiHallOfFame.id]
	}),
}));

export const aiHallOfFameRelations = relations(aiHallOfFame, ({many}) => ({
	aiTimelines: many(aiTimeline),
}));

export const userOauthAccountsRelations = relations(userOauthAccounts, ({one}) => ({
	user: one(users, {
		fields: [userOauthAccounts.userId],
		references: [users.id]
	}),
}));

export const newsTagsRelations = relations(newsTags, ({one}) => ({
	aiNew: one(aiNews, {
		fields: [newsTags.newsId],
		references: [aiNews.id]
	}),
	tag: one(tags, {
		fields: [newsTags.tagId],
		references: [tags.id]
	}),
}));

export const aiNewsRelations = relations(aiNews, ({many}) => ({
	newsTags: many(newsTags),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	newsTags: many(newsTags),
}));