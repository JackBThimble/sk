import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	scores: many(score)
}));

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const game = sqliteTable('game', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	thumbnail: text('thumbnail'),
	category: text('category').notNull(),
	tags: text('tags'),
	difficulty: text('difficulty').notNull(),
	releaseDate: text('release_date')
		.default(sql`(CURRENT_DATE)`)
		.notNull(),
	version: text('version'),
	author: text('author'),
	controls: text('controls'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export const gameRelations = relations(game, ({ many }) => ({
	scores: many(score)
}));

export const score = sqliteTable('score', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	gameId: text('game_id')
		.notNull()
		.references(() => game.id),
	score: integer('score').notNull(),
	metadata: text('metadata'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const scoreRelations = relations(score, ({ one }) => ({
	user: one(user, {
		fields: [score.userId],
		references: [user.id]
	}),
	game: one(game, {
		fields: [score.gameId],
		references: [game.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Game = typeof game.$inferSelect;
export type Score = typeof score.$inferSelect;
