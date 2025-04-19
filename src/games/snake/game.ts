import { GameEngine } from '../core/engine';
import { InputManager } from '../core/input';
import { AudioManager, AudioAsset } from '../core/audio';
import { GameStorage } from '../core/storage';
import { Direction , GameState, Difficulty, GameSettings, Vector2D,  IGame } from '../core/types';

const CELL_SIZE = 20;

// snake game settings
interface SnakeSettings extends GameSettings {
    snakeColor: string;
    foodColor: string;
    gridColor: string;
    speed: number;
    growAmount: number;
}

// direction vectors
const DIRECTION_VECTORS: Record<Direction, Vector2D> = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT] : { x: -1, y: 0 },
    [Direction.RIGHT] : { x: 1, y: 0 },
    [Direction.NONE] : { x: 0, y: 0 }
};

// Snake segment
interface SnakeSegment {
    x: number;
    y: number;
}

// Food item
interface Food {
    x: number; 
    y: number;
    value: number;
}

/**
 * Snake game implementation using the GameEngine
 */
export class SnakeGame extends GameEngine implements IGame {
    // game objects
    private snake: SnakeSegment[] = [];
    private food: Food | null = null;
    private direction: Direction = Direction.RIGHT;
    private nextDirection: Direction = Direction.RIGHT;
    private gridWidth: number = 0;
    private gridHeight: number = 0;

    // game state 
    private timeSinceLastMove = 0;
    private moveDelay: number;
    private growing = 0;
    private gameOver = false;

    // game settings
    private settings: SnakeSettings;

    // input manager 
    private input: InputManager;

    // audio manager
    private audio: AudioManager;

    // game storage
    private storage: GameStorage;

    private readonly DEFAULT_SETTINGS: SnakeSettings = {
        difficulty: Difficulty.EASY,
        soundEnabled: true,
        musicEnabled: true,
        volume: 0.7,
        snakeColor: 'limegreen',
        foodColor: 'red',
        gridColor: 'gray',
        speed: 10, // cells per second
        growAmount: 1,
    }

    /**
     * Create a new snake game
     */
    constructor(canvasId: string, width: number, height: number) {
        super(canvasId, width, height); 

        // Calculate grid dimensions
        this.gridWidth = Math.floor(width / CELL_SIZE);
        this.gridHeight = Math.floor(height / CELL_SIZE);

        // Initialize settings
        this.settings = {
            ...this.DEFAULT_SETTINGS,
        }
        this.moveDelay = 1000 / this.settings.speed;

        // Initialize input manager
        this.input = new InputManager();
        this.input.attachCanvas(this.canvas);

        // Initialize audio manager
        this.audio = new AudioManager();

        // Initialize game storage
        this.storage = new GameStorage('snake');

        // Load saved game settings
        const savedSettings = this.storage.loadSettings<SnakeSettings>();
        if (savedSettings) {
            this.settings = {
                ...THIS.DEFAULT_SETTINGS,
                ...savedSettings,
            };
        }
        this.reset();
        this.setupInputHandlers();
    }

    /**
     * Initialize the game
     */
    async init(): Promise<void> {
        // Load audio assets
        const audioAssets: AudioAsset[] = [
            { id: 'eat', url: 'assets/sounds/eat.mp3' }
,
            { id: 'die', url: 'assets/sounds/die.mp3'},
            { id: 'move', url:  'assets/sounds/move.mp3' }
        ];

        try {
            await this.audio.init(audioAssets);
            this.audio.loadMusic('background', 'assets/music/background.mp3', 0.5, true);
        } catch (e) {
            console.warn('Failed to load audio assets: ', e);
        }

        const highScore = this.storage.loadHighScore();
        this.highScore = highScore || 0;
    }

    /**
     * Setup input handlers
     */
    private setupInputHandlers(): void {
        // keyboard handlers
        this.input.onKeyPress((key) => {
            switch(key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                case 'k':
                case 'K':
                    if (this.direction !== Direction.DOWN) {
                        this.nextDirection = Direction.UP;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                case 'j':
                case 'J':
                    if (this.direction !== Direction.UP) {
                        this.nextDirection = Direction.DOWN;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                case 'h':
                case 'H':
                    if (this.direction !== Direction.RIGHT) {
                        this.nextDirection  = Direction.LEFT;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                case 'l':
                case 'L':
                    if (this.direction !== Direction.LEFT) {
                        this.nextDirection = Direction.RIGHT;
                    }
                    break;

                case ' ':
                case 'p':
                case: 'P':
                    if (this.gameState === GameState.PLAYING) {
                        this.pause();
                    } else if (
                        this.gameState === GameState.PAUSED) {
                        this.resume()
                    } else if (this.gameState === GameState.GAME_OVER) {
                        this.reset();
                        this.start();
                    }
                    break;
            }
        });
        // touch handlers
        this.input.onTouchStart((touches) => {
            if (touches.lenght === 0) return;
            const touch = touches[0];
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            const dx = touch.x - centerX;
            const dy = touch.y - centerY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // horizontal movement
                if (dx > 0 && this.direction !== Direction.LEFT) {
                    this.nextDirection = Direction.RIGHT;
                } else if (dx < 0 && this.direction !== Direction.RIGHT) {
                    this.nextDirection = Direction.LEFT;                
                }   
            } else {
                // vertical movement
                if (dy > 0 && this.direction !== Direction.UP) {
                    this.nextDirection = Direction.DOWN;
                } else if (dy < 0 && this.direction !== Direction.DOWN) {
                    this.nextDirection = Direction.UP;
                }
            }
            
            
        });
    }

    /**
     * reset to initial state 
     */
    reset(): void {
        super.reset();
        this.snake = [{
            x: Math.floor(this.gridWidth / 2),
            y: Math.floor(this.gridHeight / 2),
        }];
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.timeSinceLastMove = 0;
        this.growing = 0;
        this.gameOver = false;
        this.score = 0;

        // spawn food
        this.createFood();

        this.gameState = GameState.READY;
    }

    /**
     * Start the game
     */
    start(): void {
        if (this.gameState === GameState.INIT || this.gameState === GameState.GAME_OVER) {
            super.start();

            if (this.settings.musicEnabled) {
                this.audio.playMusic('background');
            }
        }
    }

    /**
     * Pause the game
     */

    pause(): void {
        if (this.gameState === GameState.PLAYING) {
            super.pause();
            this.audio.pauseMusic();
        }
    }

    /**
     * Resume the game
     */
    resume(): void {
        if (this.gameState === GameState.PAUSED) {
            super.resume();
            if(this.settings.musicEnabled) {
                this.audio.resumeMusic();
            }
        }
    }

    /**
     * Game over
     */
    gameOver(): void {
        this.gameState = GameState.GAME_OVER; 
        this.gameOver = true;

        if (this.settings.soundEnabled) {
            this.audio.playSound('die');
        }

        this.audio.stopMusic();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.storage.savedHighScore(this.highScore);
        }

        // save score to server if authenticated
        this.storage.saveScoreToServer(this.score, {
            snakeLength: this.snake.length,
            difficulty: this.settings.difficulty;
        });
        this.emit('gameOver', {
            score: this.score,
            highScore: this.highScore
        });
    }
    
    /**
     * Update game state
     */
    protected update(deltaTime: number): void {
        if (this.gameState !== GameState.PLAYING || this.gameOver) {
            return;
        }
        this.timeSinceLastMove += deltaTime;

        if (this.timeSinceLastMove >= this.moveDelay) {
            this.timeSinceLastMove = 0;
            this.moveSnake();
        }
    }

    /**
     * Render the game
     */
    protected render(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawSnake();
        this.drawFood();
        this.drawUI();
    }

    /**
     * Draw the grid
     */
    private drawGrid(): void {
        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.2;

        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE,
                           this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(this.width, y * CELL_SIZE);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha  = 1;
    }

    /**
     * Draw the snake
     */
    private drawSnake(): void {
        this.ctx.fillStyle = this.settings.snakeColor;

        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];

            if (i === 0) {
                this.drawRoundedRect(
                    segment.x * CELL_SIZE + 1, 
                    segment.y * CELL_SIZE + 1, 
                    CELL_SIZE - 2, 
                    CELL_SIZE - 2, 
                    5);
            } else {
                this.ctx.fillRect(
                    segment.x * CELL_SIZE + 1,
                    segment.y * CELL_SIZE + 1,
                    CELL_SIZE - 2,
                    CELL_SIZE - 2
                );
            }
        }
    }

    /**
     * Draw the food
     */
    private drawFood(): void {
        if (!this.food) return;

        this.ctx.fillStyle = this.settings.foodColor;

        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * CELL_SIZE + CELL_SIZE / 2, 
            this.food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
    }

    /**
     * Draw the UI
     */
    private drawUI(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        this.ctx.fillText(`Score: ${this.score}`, 10, 10); 

        this.ctx.textAlign = 'right';
        this.ctx.fillText(`High Score: ${this.highScore}`, this.width - 10, 10);

        if (this.gameState === GAMESTATE.GAME_OVER) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 40);

            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2);

            this.ctx.font = '18px Arial';
            this.ctx.fillText('Press SPACE to play again', this.width / 2, this.height / 2 + 40);
        }

        if (this.gameState === GameState.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

            this.ctx.font = '18px Arial';
            this.ctx.fillText('Press SPACE to resume', this.width / 2, this.height / 2 + 40);
        }
    }

    /**
     * Move the snake
     */
    private moveSnake(): void {
        if (this.gameOver) return;

        this.direction = this.nextDirection;

        const dirVector = DIRECTION_VECTORS[this.direction];

        const head = this.snake[0];
        const newHead: SnakeSegment = {
            x: head.x + dirVector.x,
            y: head.y + dirVector.y,
        };

        if (
            newHead.x < 0 ||
            newHead.x >= this.gridWidth ||
            newHead.y < 0 ||
            newHead.y >= this.gridHeight
        ) {
            this.gameOver();
            return;
        }
        for (let i = 0; i < this.snake.length; i++) {
            if (newHead.x === this.snake[i].x && newHead.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        this.snake.unshift(newHead);

        if (this.settings.soundEnabled) { 
            this.audio.playSound('move', 0.2);
        }

        if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
            this.addScore(this.food.value);

            if (this.settings.soundEnabled) {
                this.audio.playSound('eat');
                
            }

            this.growing += this.settings.growAmount;

            this.createFood();

            this.moveDelay = Math.max(50, this.moveDelay * 0.98);
            
        }

        if (this.growing > 0) {
            this.growing--;
        } else {
            this.snake.pop();
        }
    }

    /**
     * create food
     */
    private createFood(): void {
        let x:number, y: number;
        let validPosition = false;

        while (!validPosition) {
            x = Math.floor(Math.random() * this.gridWidth);
            y = Math.floor(Math.random() * this.gridHeight);
            validPosition = true;
            for (const segment of this.snake) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }

        let value; 
        switch (this.settings.difficulty) {
            case Difficulty.EASY: 
                value = 10;
                break;
            case Difficulty.MEDIUM:
                value = 20;
                break;
            case Difficulty.HARD:
                value = 30;
                break;
            case Difficulty.EXPERT:
                value = 35;
                break;
            case Difficulty.MASTER: 
                value = 40;
                break;
            default:
                value = 10;
        }
        this.food = { x, y, value};
    }

    /**
     * Draw a rounded rectangle
     */

    private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }


    /**
     * Apply game settings
     */
    applySettings(settings: Partial<SnakeSettings>) {
        this.settings = {
            ...this.settings,
            ...settings
        };

        this.moveDelay = 1000 / this.settings.speed;

        if (this.settings.musicEnabled) {
            this.audio.setMusicVolume(this.settings.volume);
            if (this.gameState === GameState.PLAYING) {
                this.audio.playMusic('background');
            } 
        } else {
            this.audio.pauseMusic();
        }
        this.storage.saveSettings(this.settings);
    }

    /**
     * Get current settings
     */
    getSettings(): SnakeSettings {
        return { ...this.settings};
    }

    /**
     * Resize the game
     */
    resize(width: number, height: number): void {
        super.resize(width, height);
        this.gridWidth = Math.floor(width / CELL_SIZE); 
        this.gridHeight = Math.floor(height / CELL_SIZE);
        
    }

    /**
     * Get current game state
     */
    getState(): GameState {
        return this.gameState as GameState;
    } 

    /**
     * Clean up resources
     */
    destroy(): void {
        super.stop();
        this.input.destroy();
        this.audio.destroy();
        
    }
}