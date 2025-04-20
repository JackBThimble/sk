/**
 * Common types used by all games
 */

/**
 * Vector2D Represents a 2D point
 */
export interface Vector2D {
	x: number;
	y: number;
}

/**
 * Size represents dimensions
 */

export interface Size {
	width: number;
	height: number;
}

/**
 * Rectangle Represents a 2D rectangle
 */
export interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Circle represents a 2D circle
 */
export interface Circle {
	x: number;
	y: number;
	radius: number;
}

/**
 * Game difficulty levels
 * @enum {string}
 */
export enum Difficulty {
	EASY = 'easy',
	MEDIUM = 'medium',
	HARD = 'hard',
	EXPERT = 'expert',
	MASTER = 'master'
}

/**
 * Game states
 * @enum {string}
 */
export enum GameState {
	INIT = 'init',
	PLAYING = 'play',
	PAUSE = 'pause',
	GAME_OVER = 'game_over'
}

/**
 * Player input directions
 */
export enum Direction {
	UP = 'up',
	DOWN = 'down',
	LEFT = 'left',
	RIGHT = 'right',
	NONE = 'none'
}

/**
 * Game settings interface
 */
export interface GameSettings {
	difficulty: Difficulty;
	soundEnabled: boolean;
	musicEnabled: boolean;
	volume: number;
	[key: string]: any;
}

/**
 * Score entry for leaderboard
 */
export interface ScoreEntry {
	score: number;
	playerName: string;
	date: string;
	gameData: any;
}

/**
 * Interface that all games should implement
 */
export interface IGame {
	/// Initialize the game
	init(): Promise<void>;
	/// Start the game
	start(): void;
	/// Pause the game
	pause(): void;
	/// Resume the game
	resume(): void;
	/// Reset the game
	reset(): void;
	/// Update the game state
	update(deltaTime: number): void;
	/// Render the game
	render(): void;
	/// Cleanup resources
	destroy(): void;
	/// Get the current score
	getScore(): number;
	/// Get the current game state
	getState(): GameState;
	/// Apply game settings
	applySettings(settings: GameSettings): void;
	/// Get the current game settings
	getSettings(): GameSettings;
	/// Resize the game to new dimensions
	resize(width: number, height: number): void;
	/// Register event handlers
	on(event: string, callback: Function): void;
	/// Unregister event handlers
	off(event: string, callback: Function): void;
}

/**
 * Base game metadata for the browser
 */
export interface GameMetadata {
	id: string;
	title: string;
	description: string;
	thumbnail: string;
	category: GameCategory;
	tags: string[];
	difficulty: Difficulty;
	releaseDate: string;
	version: string;
	author: string;
	controls: {
		keyboard?: string[];
		touch?: string[];
		gamepad?: string[];
	};
}

/**
 * Game categories
 */
export enum GameCategory {
	ARCADE = 'arcade',
	PUZZLE = 'puzzle',
	ACTION = 'action',
	STRATEGY = 'strategy',
	BOARD = 'board',
	SPORTS = 'sports',
	RACING = 'racing',
	CARD = 'card',
	RPG = 'rpg',
	OTHER = 'other'
}

/**
 * Sound effects types
 */
export interface SoundEffect {
	id: string;
	url: string;
	volume?: number;
	loop?: boolean;
}

/**
 * Music track
 */
export interface MusicTrack {
	id: string;
	url: string;
	volume?: number;
	loop?: boolean;
}

/**
 * Game assets
 */
export interface GameAssets {
	sprites: {
		[key: string]: string;
	};
	sounds: SoundEffect[];
	music: MusicTrack[];
	fonts?: {
		[key: string]: string;
	};
}

/**
 * Level definition
 */
export interface Level {
	id: string;
	title: string;
	difficulty: Difficulty;
	data: any;
}

