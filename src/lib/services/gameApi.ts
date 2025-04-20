export interface ScoreRecord {
	id: string;
	gameId: string;
	userId: string;
	score: number;
	metadata?: Record<string, any>;
	createdAt: string;
	user?: {
		id: string;
		username: string;
	};
}

interface SaveScoreResponse {
	success: boolean;
	scoreId?: string;
	message?: string;
}

interface GetHighScoreResponse {
	success: boolean;
	scores?: ScoreRecord[];
	message?: string;
}

export async function saveScore(
	gameId: string,
	score: number,
	metadata?: Record<string, any>
): Promise<SaveScoreResponse> {
	try {
		const response = await fetch('/api/scores', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameId,
				score,
				metadata
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Error saving score: ', errorData);
			return {
				success: false,
				message: errorData.message || 'Failed to save scores'
			};
		}

		return await response.json();
	} catch (error) {
		console.error('Error saving score:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

export async function getHighScores(gameId: string, limit = 10): Promise<GetHighScoreResponse> {
	try {
		const response = await fetch(`api/scores?gameId=${gameId}&limit=${limit}`);

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Error fetching high scores:', errorData);
			return {
				success: false,
				message: errorData.message || 'Failed to fetch high scores'
			};
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching high scores: ', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
