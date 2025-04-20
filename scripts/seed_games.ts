/**
 * Script to seed the database with initial game data
 *
 * Run with: npx tsx scripts/seed-games.ts
 */

import { db } from './db.ts';
import * as schema from '../src/lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';

const games = [
	{
		id: 'snake',
		title: 'Snake',
		description:
			"The classic snake game. Eat food to grow longer, but don't run into yourself or the walls!",
		thumbnail: '/games/snake/thumbnail.png',
		category: 'arcade',
		tags: JSON.stringify(['classic', 'arcade', 'single-player']),
		difficulty: 'easy',
		releaseDate: new Date('2025-04-18'),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: ['Arrow keys, WASD, or HJKL to move the snake', 'Space to pause/resume the game'],
			touch: ['Swipe in the direction you want to move', 'Tap to pause/resume']
		})
	},
	{
		id: 'tetris',
		title: 'Tetris',
		description:
			'Arrange falling blocks to create complete lines. How many rows can you clear before the stack reaches the top?',
		thumbnail: '/games/tetris/thumbnail.png',
		category: 'puzzle',
		tags: JSON.stringify(['classic', 'puzzle', 'single-player']),
		difficulty: 'medium',
		releaseDate: new Date('2025-05-01'),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: [
				'Left/Right arrows to move pieces',
				'Up arrow to rotate',
				'Down arrow to soft drop',
				'Space to hard drop',
				'C to hold piece',
				'P to pause'
			],
			touch: [
				'Swipe left/right to move pieces',
				'Swipe up to rotate',
				'Swipe down to drop',
				'Double tap to hold piece',
				'Tap in corner to pause'
			]
		})
	},
	{
		id: 'pong',
		title: 'Pong',
		description:
			'The classic two-player paddle game. Keep the ball from passing your paddle while trying to score on your opponent.',
		thumbnail: '/games/pong/thumbnail.png',
		category: 'arcade',
		tags: JSON.stringify(['classic', 'arcade', 'multiplayer']),
		difficulty: 'easy',
		releaseDate: new Date('2025-04-25'),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: [
				'Player 1: W/S to move paddle up/down',
				'Player 2: Arrow keys up/down to move paddle',
				'Space to pause/resume'
			],
			touch: ['Slide finger to move paddle', 'Tap center to pause/resume']
		})
	},
	{
		id: 'breakout',
		title: 'Breakout',
		description:
			"Break all the bricks with a ball and paddle. Don't let the ball fall below your paddle!",
		thumbnail: '/games/breakout/thumbnail.png',
		category: 'arcade',
		tags: JSON.stringify(['classic', 'arcade', 'single-player']),
		difficulty: 'easy',
		releaseDate: new Date('2025-05-10'),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: ['Left/Right arrows to move paddle', 'Space to launch ball and pause/resume'],
			touch: ['Slide finger to move paddle', 'Tap to launch ball and pause/resume']
		})
	},
	{
		id: 'chess',
		title: 'Chess',
		description: 'The classic strategy board game. Play against the computer or another player.',
		thumbnail: '/games/chess/thumbnail.png',
		category: 'board',
		tags: JSON.stringify(['classic', 'strategy', 'board', 'multiplayer']),
		difficulty: 'hard',
		releaseDate: new Date('2025-06-01'),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: [
				'Use arrow keys to navigate the board',
				'Enter to select and move pieces',
				'R to restart the game',
				'U to undo last move'
			],
			touch: [
				'Tap to select a piece',
				'Tap again to place it',
				'Double tap in corner to menu options'
			]
		})
	},
	{
		id: 'flappy-bird',
		title: 'Flappy Bird',
		description:
			'Navigate a bird through a series of pipes without hitting them. How far can you go?',
		thumbnail: '/games/flappy-bird/thumbnail.png',
		category: 'arcade',
		tags: JSON.stringify(['arcade', 'casual', 'single-player']),
		difficulty: 'medium',
		releaseDate: new Date(2025, 5, 15),
		version: '1.0.0',
		author: 'SK Games',
		controls: JSON.stringify({
			keyboard: ['Space or Up arrow to flap', 'P to pause'],
			touch: ['Tap to flap', 'Double tap to pause']
		})
	}
];

async function seedGames() {
	console.log('Seeding games...');

	try {
		// Check if games already exist
		const existingGames = await db.query.game.findMany();

		if (existingGames.length > 0) {
			console.log(`Found ${existingGames.length} existing games. Skipping seed.`);
			return;
		}

		const timestamp = new Date();

		// Insert games
		for (const game of games) {
			await db.insert(schema.game).values({
				id: game.id,
				title: game.title,
				description: game.description,
				difficulty: game.difficulty,
				author: game.author,
				category: game.category,
				controls: game.controls,
				releaseDate: game.releaseDate.toString(),
				tags: game.tags,
				thumbnail: game.thumbnail,
				version: game.version,
				createdAt: timestamp,
				updatedAt: timestamp
			});
			console.log(`Added game: ${game.title}`);
		}

		console.log('Games seeded successfully!');
	} catch (error) {
		console.error('Error seeding games:', error);
		process.exit(1);
	}
}

// Run the seed function
seedGames().then(() => process.exit(0));
