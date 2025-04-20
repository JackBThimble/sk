import { db } from '$lib/server/db';
import { desc, eq, and, sql } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get all games
	const games = await db.query.game.findMany({
		orderBy: [desc(schema.game.title)]
	});

	// Get top scores for all games
	const scoresQuery = db.query.score.findMany({
		orderBy: [desc(schema.score.score)],
		limit: 100, // Get a reasonable number of scores to filter by game client-side
		with: {
			user: {
				columns: {
					id: true,
					username: true
				}
			}
		}
	});

	const scores = await scoresQuery;

	// Group scores by game and take top 10 for each
	const gameScoresMap = new Map<string, typeof scores>();

	for (const score of scores) {
		if (!gameScoresMap.has(score.gameId)) {
			gameScoresMap.set(score.gameId, []);
		}

		const gameScores = gameScoresMap.get(score.gameId)!;

		if (gameScores.length < 10) {
			gameScores.push(score);
		}
	}

	// Flatten the scores back to an array
	const topScores = Array.from(gameScoresMap.values()).flat();

	// Get user-specific scores if authenticated
	let userBestScores: any[] = [];

	if (locals.user) {
		// This query gets the best score for each game for the current user
		// along with their rank for each game

		// First, find the user's best score for each game
		const userScoresQuery = db
			.select({
				id: schema.score.id,
				gameId: schema.score.gameId,
				userId: schema.score.userId,
				score: schema.score.score,
				createdAt: schema.score.createdAt,
				metadata: schema.score.metadata
			})
			.from(schema.score)
			.where(eq(schema.score.userId, locals.user.id))
			.groupBy(schema.score.gameId)
			.orderBy(desc(schema.score.score));

		const userScores = await userScoresQuery;

		// Then compute the rank for each score
		for (const userScore of userScores) {
			// Count how many scores are higher than this one
			const betterScoresCount = await db
				.select({
					count: sql<number>`count(distinct ${schema.score.userId})`
				})
				.from(schema.score)
				.where(
					and(
						eq(schema.score.gameId, userScore.gameId),
						sql`${schema.score.score} > ${userScore.score}`
					)
				);

			userBestScores.push({
				...userScore,
				rank: betterScoresCount[0]?.count != null ? betterScoresCount[0].count + 1 : null
			});
		}
	}

	return {
		games,
		scores: topScores,
		userBestScores,
		user: locals.user
	};
};
