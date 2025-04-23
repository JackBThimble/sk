import thumbnailUrl from './assets/img/tetris-thumbnail.png';
import { SnakeGame } from '../snake/game';
import type { GameMetadata } from '../core/types';
import { GameCategory, Difficulty } from '../core/types';

export const metadata: GameMetadata = {
	author: 'SK Games',
	category: GameCategory.ARCADE,
	controls: {
		keyboard: [
			'Arrow keys, VIM motion keys, or WASD keys to move the snake.',
			'Space to pause/resume the game.'
		],
		touch: [
			'Swipe in the direction you want the snake to move.',
			'Tap the screen to pause/resume the game.'
		]
	},
	description: 'A classic game of Tetris',
	difficulty: Difficulty.MEDIUM,
	id: 'tetris',
	title: 'Tetris',
	releaseDate: '2025-08-08',
	tags: ['puzzle', 'strategy', 'tetris', 'blocks'],
	thumbnail: thumbnailUrl,
	version: '0.0.0'
};

export async function createGame(
	canvasId: string,
	width: number,
	height: number
): Promise<SnakeGame> {
	const game = new SnakeGame(canvasId, width, height);
	await game.init();
	return game;
}

export default {
	metadata,
	createGame
};
