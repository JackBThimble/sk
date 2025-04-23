import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug } = params;

	try {
		const game = await db.query.game.findFirst({
			where: (game, { eq }) => eq(game.id, slug)
		});

		if (!game) {
			throw error(404, { message: 'Game not found' });
		}

		const highScores = await db.query.score.findMany({
			where: (score, { eq }) => eq(score.gameId, slug),
			orderBy: [desc(schema.score.score)],
			limit: 10,
			with: {
				user: {
					columns: {
						id: true,
						username: true
					}
				}
			}
		});

		let userStats = null;
		if (locals.user) {
			const userBestScore = await db.query.score.findFirst({
				where: (score, { and, eq }) =>
					and(eq(score.gameId, slug), eq(score.userId, locals.user.id)),
				orderBy: [desc(schema.score.score)]
			});

			const userScores = await db.query.score.findMany({
				where: (score, { and, eq }) =>
					and(eq(score.gameId, slug), eq(score.userId, locals.user.id))
			});

			let userRank = null;
			if (userBestScore) {
				const betterScores = await db.query.score.findMany({
					where: (score, { and, eq, gt }) =>
						and(eq(score.gameId, slug), gt(score.score, userBestScore.score))
				});
				userRank = betterScores.length + 1;
			}

			userStats = {
				userBestScore: userBestScore?.score || 0,
				userPlayCount: userScores.length,
				userRank
			};
		}

		return {
			game,
			highScores,
			...(userStats || {}),
		};
	} catch (error) {		
		console.error('Error loading game:', error);
		throw error;
	}
};
