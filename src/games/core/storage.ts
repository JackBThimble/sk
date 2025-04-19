/**
 * GameStorage handles saving and loading game state to and from localStorage
 */
export class GameStorage {
    /** Prefix for keys saved in localStorage */
    private prefix: string;

    /**
     * Create a new GameStorage instance
     * @param gameId - Unique identifier for the game
     */
    constructor(private gameId: string) {
        this.prefix = `game_${gameId}_`;
    }

    /**
     * Save data to localStorage
     *
     * @param key - Key to store data under
     * @param data - Data to store
     */
    save<T>(key: string, data: T): boolean {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.error(`Failed to save data for key ${key}: `, e);
            return false;
        }
    }

    /**
     * Load data from localStorage
     *
     * @param key - Key to load data for
     * @param defaultValue - Value to return if key does not exist
     */
    load<T>(key: string, defaultValue?: T): T | null {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) {
                return defaultValue !== undefined ? defaultValue : null;
            }
            return JSON.parse(serialized) as T;
        } catch (e) {
            console.error(`Failed to load data for key ${key}: `, e);
            return defaultValue !== undefined ? defaultValue : null;
        }
    }

    /**
     * Delete data from localStorage
     *
     * @param key - Key to delete data for
     */
    delete(key: string): boolean {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error(`Failed to delete data for key ${key}: `, e);
            return false;
        }
    }

    /**
     * Clear all game data from localStorage
     */
    clearAll(): void {

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * Check if data exists for a key
     *
     * @param key - Key to check for
     */
    has(key: string): boolean {
        return localStorage.getItem(this.prefix + key) !== null;
    }

    /**
     * Save high score for the game
     *
     * @param score - Score to save
     */
    saveHighScore(score: number): boolean {
        return this.save('highScore', score);
    }

    /**
     * Load high score for the game
     */
    loadHighScore(): number {
        return this.load<number>('highScore', 0) || 0;
    }

    /**
     * Save a players progress or game state
     *
     * @param state - State to save
     */
    saveGameState<T>(state: T): boolean {
        return this.save('gameState', state);
    }

    /**
     * Load a players progress or game state
     */
    loadGameState<T>(): T | null {
        return this.load<T>('gameState');
    }

    /**
     * Save a players settings
     *
     * @param settings - Settings to save
     */
    saveSettings<T>(settings: T): boolean {
        return this.save('settings', settings);
    }

    /**
     * Load player settings
     */
    loadSettings<T>(): T | null {
        return this.load<T>('settings');
    }

    /**
     * Save players level progress
     *
     * @param levelData - The level progress data
     */
    saveLevelProgress<T>(levelData: T): boolean {
        return this.save('levelProgress', levelData);
    }

    /**
     * Load players level progress
     */
    loadLevelProgress<T>(): T | null {
        return this.load<T>('levelProgress');
    }

    /**
     * Save scores to server (if authenticated)
     *
     * @param score - Score to save
     * @param gameData - Additional game data to save
     */
    async saveScoreToServer(score: number, gameData?: any): Promise<boolean> {
        // TODO: IMPLEMENT SERVER LOGIC
        try {
            /*

            const response = await fetch('/api/scores, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                gameId: this.gameId,
                score,
                ...gameData,
                }),     
            });
            return response.ok;
            */
            console.log(`Would save ${score} for ${this.gameId} to server`, gameData);
            return true;
        } catch(e) {
            console.error(`Failed to save score ${score} for ${this.gameId} to server: `, e);
            return false;
        }   
    }

    /**
     * Load high scores from server
     *
     * @param limit - Number of scores to load
     */
    async loadHighScoresFromServer(limit = 10): Promise<any[]> {
        // TODO: IMPLEMENT SERVER LOGIC
        try {
            /*
            const response = await fetch(`apj/scores/${this.gameId}?limit=${limit}`);
            if (response.ok) {
                return await response.json();
            }
            */
            console.log(`Would load high scores for ${this.gameId} from. server`); 
            return [];
        }
        catch(e) {
            console.error(`Failed to load high scores for ${this.gameId}:`, e);
            return [];
        }
    }
}
