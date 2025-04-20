import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('Loading games page data...');
	try {
		const games = await db.select().from(schema.game);
		console.log(`Found ${games.length} games`);

		let userScores: schema.Score[] = [];
		if (locals.user) {
			userScores = await db
				.select()
				.from(schema.score)
				.where(eq(schema.score.userId, locals.user.id));
			console.log(`Found ${userScores.length} user scores.`);
		}
		return {
			games,
			userScores
		};
	} catch (error) {
		console.error('Error loading games: ', error);
		return {
			games: [],
			userScores: []
		};
	}
};
