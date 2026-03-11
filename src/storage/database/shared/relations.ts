import { relations } from "drizzle-orm/relations";
import { users, publisherApplications, aiTools, aiToolRankings, categories } from "./schema";

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

export const usersRelations = relations(users, ({many}) => ({
	publisherApplications_reviewedBy: many(publisherApplications, {
		relationName: "publisherApplications_reviewedBy_users_id"
	}),
	publisherApplications_userId: many(publisherApplications, {
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

export const aiToolsRelations = relations(aiTools, ({many}) => ({
	aiToolRankings: many(aiToolRankings),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	aiToolRankings: many(aiToolRankings),
}));