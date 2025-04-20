import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get all games for reference
	const games = await db.query.game.findMany();

	// Get featured games (could be based on various criteria)
	// For now, just get the 3 most recent games
	const featuredGames = games.slice(0, 3);

	// Get recent high scores
	const recentScores = await db.query.score.findMany({
		orderBy: [desc(schema.score.createdAt)],
		limit: 5,
		with: {
			user: {
				columns: {
					id: true,
					username: true
				}
			}
		}
	});

	// Get user's scores if authenticated
	let userScores: schema.Score[] = [];
	if (locals.user) {
		userScores = await db.query.score.findMany({
			where: (score, { eq }) => eq(score.userId, locals.user.id),
			with: {
				user: {
					columns: {
						id: true,
						username: true
					}
				}
			}
		});
	}

	return {
		games,
		featuredGames,
		recentScores,
		userScores,
		user: locals.user
	};
};
