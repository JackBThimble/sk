import { time } from 'drizzle-orm/singlestore-core';

export class GameEngine {
	/** Canvas element to render the game on */
	protected canvas: HTMLCanvasElement;
	/** 2D rendering context */
	protected ctx: CanvasRenderingContext2D;
	/** Id returned by requestAnimationFrame for cancellation */
	private animationFrameId: number | null = null;
	/** Flag to track if the game loop is running */
	private isRunning = false;
	/** Game updating and rendering frequency in milliseconds */
	protected frameRate = 1000 / 60; // 60 fps by default
	/** Time of the last frame */
	private lastFrameTime = 0;
	/** Game state (playing, paused, game over, etc. ) */
	protected gameState: 'init' | 'playing' | 'paused' | 'gameOver' = 'init';
	/** current score */
	protected score = 0;
	/** high score */
	protected highScore = 0;
	/** event callbacks for game events */
	private eventCallbacks: Record<string, Function[]> = {};

	/**
	 * Create a new game engine instance
	 *
	 * @param canvasId - The id of the canvas element to render on
	 * @param width - Canvas width
	 * @param height - Canvas height
	 */
	constructor(
		canvasId: string,
		protected width: number,
		protected height: number
	) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

		if (!canvas) {
			throw new Error(`Canvas element with ID: "${canvasId}" not found`);
		}
		this.canvas = canvas;
		this.canvas.width = width;
		this.canvas.height = height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Failed to get 2D rendering context');
		}
		this.ctx = ctx;

		this.loadHighScore();
	}

	/**
	 * Start the game loop
	 */
	start(): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this.gameState = 'playing';
		this.lastFrameTime = performance.now();
		this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
		this.emit('gameStart');
	}

	/**
	 * Pause the game
	 */
	pause(): void {
		if (this.gameState !== 'playing') return;

		this.gameState = 'paused';
		this.emit('gamePause');
	}

	/**
	 * Resume the game
	 */
	resume(): void {
		if (this.gameState !== 'paused') return;

		this.gameState = 'playing';
		this.lastFrameTime = performance.now();
		this.emit('gameResume');
	}

	/**
	 * Stop the game loop
	 */
	stop(): void {
		if (!this.isRunning) return;

		this.isRunning = false;
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.emit('gameStop');
	}

	/**
	 * Reset the game to its initial state
	 */
	reset(): void {
		this.score = 0;
		this.gameState = 'init';
		this.emit('gameReset');
	}

	/**
	 * End the current game
	 */
	gameOver(): void {
		this.gameState = 'gameOver';

		if (this.score > this.highScore) {
			this.highScore = this.score;
			this.saveHighScore();
		}

		this.emit('gameOver', { score: this.score, highScore: this.highScore });
	}

	/**
	 * The main game loop
	 */
	private gameLoop(timestamp: number): void {
		if (!this.isRunning) return;

		const deltaTime = timestamp - this.lastFrameTime;

		if (deltaTime >= this.frameRate) {
			this.lastFrameTime = timestamp;

			if (this.gameState === 'playing') {
				// clear the canvas
				this.ctx.clearRect(0, 0, this.width, this.height);
				// update the game state
				this.update(deltaTime);
				// render the game
				this.render();
			}
		}
		this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
	}

	/**
	 * Update the game state - override in subclasses
	 */
	protected update(deltaTime: number): void {
		// To be implemented by specific games
	}

	/**
	 * Render the game - overrride in subclasses
	 */
	protected render(): void {
		// To be rendered by specific games
	}

	/**
	 * Add points to the current score
	 */
	protected addScore(points: number): void {
		this.score += points;
		this.emit('scoreChange', { score: this.score });
	}

	/**
	 * Save high score to localStorage
	 */
	private saveHighScore(): void {
		try {
			localStorage.setItem(`highScore_${this.constructor.name}`, this.highScore.toString());
		} catch (e) {
			console.warn('Failed to save high score to localStorage');
		}
	}

	/**
	 * Load high score from localStorage
	 */
	private loadHighScore(): void {
		try {
			const savedHighScore = localStorage.getItem(`highScore_${this.constructor.name}`);
			if (savedHighScore) {
				this.highScore = parseInt(savedHighScore, 10);
			}
		} catch (e) {
			console.warn('Failed to load high score from localStroage', e);
		}
	}

	/**
	 * Get the current score
	 */
	getScore(): number {
		return this.score;
	}

	/**
	 * Get the high score
	 */
	getHighScore(): number {
		return this.highScore;
	}

	/**
	 * Get the current game state
	 */
	getGameState(): string {
		return this.gameState;
	}

	/**
	 * Register an event callback
	 */
	on(event: string, callback: Function): void {
		if (!this.eventCallbacks[event]) {
			this.eventCallbacks[event] = [];
		}
		this.eventCallbacks[event].push(callback);
	}

	/**
	 * Remove and event callback
	 */
	off(event: string, callback: Function): void {
		if (!this.eventCallbacks[event]) return;

		this.eventCallbacks[event] = this.eventCallbacks[event].filter((cb) => cb !== callback);
	}

	/**
	 * Emit an event
	 */
	protected emit(event: string, data?: any): void {
		if (!this.eventCallbacks[event]) return;

		for (const callback of this.eventCallbacks[event]) {
			callback(data);
		}
	}

	/**
	 * Resize the game canvas
	 */
	resize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
	}
}
