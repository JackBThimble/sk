import { SnakeGame } from './game';
import { GameCategory, Difficulty, type GameMetadata } from '../core/types';

export const metadata: GameMetadata = {
    id: 'snake',
    title: 'Snake',
    description: 'A classic snake game.',
    category: GameCategory.ARCADE,
    tags: ['classic', 'arcade', 'snake'],
    difficulty: Difficulty.EASY,
    releaseDate: '2025-04-18',
    version: '0.0.1',
    author: 'SK Games',
    controls: {
        keyboard: [
            "Arrow keys, VIM motion keys, or WASD keys to move the snake.", "Space to pause/resume the game.",
        ],
        touch: [
            "Swipe in the direction you want the snake to move.", "Tap the screen to pause/resume the game."
        ]
    }
};

export async function createGame(canvasId: string, width: number, height: number): Promise<SnakeGame> {
    const game = new SnakeGame(canvasId, width, height);
    await game.init();
    return game;
}

export default {
    metadata,
    createGame
}
