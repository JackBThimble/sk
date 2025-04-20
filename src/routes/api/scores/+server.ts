import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized' });
	}

	try {
		const data = await request.json();

		if (!data.gameId || typeof data.score !== 'number') {
			return json(
				{ success: false, message: 'Missing required fields: gameId and score' },
				{ status: 400 }
			);
		}

		const scoreId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(10)));

		await db.insert(schema.score).values({
			id: scoreId,
			userId: locals.user.id,
			gameId: data.gameId,
			score: data.score,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
			createdAt: new Date()
		});

		return json({ success: true, scoreId });
	} catch (error) {
		console.error('Error saving score', error);
		return json(
			{ success: false, message: 'An error occurred while saving the score' },
			{ status: 500 }
		);
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const gameId = url.searchParams.get('gameId');
		const limit = parseInt(url.searchParams.get('limit') || '10', 10);

		if (!gameId) {
			return json(
				{ success: false, message: 'Missing required parameter: gameId' },
				{ status: 400 }
			);
		}

		const query = db.query.score.findMany({
			where: (score, { eq }) => eq(score.gameId, gameId),
			orderBy: (score, { desc }) => [desc(score.score)],
			limit,
			with: {
				user: {
					columns: {
						id: true,
						username: true
					}
				}
			}
		});
		const scores = await query;

		return json({ success: true, scores });
	} catch (e) {
		console.error('Error fetching scores: ', e);
		return json(
			{ success: false, message: 'An error occurred while fetching scores' },
			{ status: 500 }
		);
	}
};
