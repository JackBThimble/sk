/**
 * Audio asset types
 */
export type AudioAsset = {
    id: string;
    url: string;
    volume?: number;
    loop?: boolean;
    autoplay?: boolean;
    preload?: boolean;
    muted?: boolean;
    playbackRate?: number:
    currentTime?: number;
    duration?: number;
    paused?: boolean;
    ended?: boolean;
    error?: boolean;
}

/**
 * AudioManager for game sound effects and music
 */
export class AudioManager {
    /** Audio context */
    private context: AudioContext | null = null;
    /** Map of loaded sounds */
    private sounds: Map<string, AudioBuffer> = new Map();
    /** Currently playing sound sources */
    private activeSources: Map<string, AudioBufferSourceNode[]> = new Map();
    /** Music track elements */
    private music: Map<string, HTMLAudioElement> = new Map();
    /** Currently playing music track */
    private currentMusic: string | null = null;
    /** Master volume */
    private masterVolume = 1.0;
    /** Sound effects volume */
    private sfxVolume = 1.0;
    /** Music volume */
    private musicVolume = 0.7;
    /** Muted state */
    private muted = false;

    constructor() {
        // Initialize audio context
        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)(); 
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }

        // Check for stored Audio preferences
        this.loadAudioPreferences();
    }

    /** Initialize by loading a set of sound assets */
    async init(assets: AudioAsset[]): Promise<void> {
        if (!this.context) return;

        const loadPromises = assets.map(async (asset) => this.loadSound(asset.id, asset.url));
        await Promise.all(loadPromises);
    }

    /** Load a sound file */
    async loadSound(id: string, url: string): Promise<void> {
        if (!this.context) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.sounds.set(id, audioBuffer);
        } catch (e) {
            console.error(`Failed to load sound ${id} from ${url}:`, e);
        }
    }

    /** Load a music track (uses HTML5 Audio for streaming) */
    loadMusic(id: string, url: string, volume = 0.7, loop = true): void {
        const audio = new Audio(url);
        audio.volume = this.muted ? 0 : volume * this.masterVolume * this.musicVolume;
        audio.loop = loop;
        this.music.set(id, audio);
    }

    /** Play a sound effect */
    playSound(id: string, volume = 1.0, loop = false, playbackRate = 1.0) {
        if (!this.context || this.muted) return;
        const buffer = this.sounds.get(id);
        if (!buffer) {
            console.warn(`Sound ${id} not found`);
            return;
        }

        // Create and configure a new source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.playbackRate = playbackRate;

        // Create gain mode for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        // Connect source to gain node and gain node to destination
        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        // Start playback 
        source.start(0);

        if (!this.activeSources.has(id)) {
            this.activeSources.set(id, []);
        }
        this.activeSources.get(id)?.push(source);

        // Cleanup up when playback completes
        source.onended = () => {
            const sources = this.activeSources.get(id);
            if (sources) {
                const index = sources.indexOf(source);
                if (index !== -1) {
                    sources.splice(index, 1);
                } 
                if (sources.length === 0) {
                    this.activeSources.delete(id);
                }
            }
        };
    }

    /** Stop all instances of a sound */
    stopSound(id: string): void {
        const sources = this.activeSources.get(id);
        if (!sources) return;

        sources.forEach((source) => {
            try {
                source.stop();
            } catch (e) {
                // ignore errors from already stopped sources
            }
        });
        this.activeSources.delete(id);
    }

    /** Play a music track */
    playMusic(id: string): void {
        if (this.currentMusic === id) return;

        // stop current music
        this.stopMusic();

        const audio = this.music.get(id);
        if (!audio) {
            console.warn(`Music track ${id} not found`);
            return;
        }
        audio.currentTime = 0;
        audio.play().catch((e) => {
            console.error(`Failed to play music track ${id}: `, e);
        });
        this.currentMusic = id;
    }

    /** Stop current music track */
    stopMusic(): void {
        if (!this.currentMusic) return;

        const audio = this.music.get(this.currentMusic);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        this.currentMusic = null;
    }

    /** Pause the current music track */
    pauseMusic(): void {
        if (!this.currentMusic) return;
        const audio = this.music.get(this.currentMusic);
        if (audio) {
            audio.pause();
        }
    }

    /** Resume current music track */
    resumeMusic(): void {
        if (!this.currentMusic) return;
        const audio = this.music.get(this.currentMusic);
        if (audio) {
            audio.play().catch(e => {
                console.error(`Failed to resume music track ${this.currentMusic}`, e);
            });
        }
    }

    /** set master volume */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        this.music.forEach(audio => {
            audio.volume = this.muted ? 0 : this.masterVolume  this.musicVolume;
        });
        this.saveAudioPreferences;
    }

    /** Set sound effects volume */
    setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveAudioPreferences();
    }

    /** Set music volume */ 
    setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.music.forEach(audio => {
            audio.volume = this.muted ? 0 : this.masterVolume * this.musicVolume;
        });
        this.saveAudioPreferences();
    }

    /** Mute all audio */
    mute(): void {
        this.muted = true;
        this.music.forEach(audio => {
            audio.volume = 0;
        });
        this.saveAudioPreferences();
    }

    /** Unmute all audio */
    unmute(): void {
        this.muted = false;
        this.music.forEach(audio => {
            audio.volume = this.masterVolume * this.musicVolume;
        });
        this.saveAudioPreferences;
    }

    /** Toggle mute state */
    toggleMute(): boolean {
        this.muted ? this.unmute() : this.mute();
        return this.muted;
    }

    /** check if audio is muted */
    isMuted(): boolean {
        return this.muted;
    }

    /** Get the current master volume */
    getMasterVolume(): number {
        return this.masterVolume;
    }

    /** Get the current sound effects volume */
    getSfxVolume(): number {
        return this.sfxVolume;
    }

    /** Get the current music volume */
    getMusicVolume(): number {
        return this.musicVolume;
    }

    /** Save audio preferences to localStorage */
    private saveAudioPreferences(): void {
        try {
            localStorage.setItem('audioPreferences', JSON.stringify({
                masterVolume: this.masterVolume,
                sfxVolume: this.sfxVolume,
                musicVolume: this.musicVolume,
                muted: this.muted
            }));
        } catch (e) {
            console.warn('Failed to save audio preferences to localStorage: ', e);
        }
    }
    
    /** Load audio preferences from localStorage */
    private loadAudioPreferences(): void {
        try {
            const preferences = localStorage.getItem('audioPreferences');
            if (preferences) {
                const { masterVolume, sfxVolume, musicVolume, muted} = JSON.parse(preferences);
                this.masterVolume = masterVolume !== undefined ? masterVolume : this.masterVolume;
                this.sfxVolume = sfxVolume !== undefined ? sfxVolume : this.sfxVolume; 
                this.musicVolume = musicVolume !== undefined ? musicVolume;
                this.muted = muted !== undefined ? muted : this.muted;
            }
        } catch (e) {
            console.warn('Failed to load audio preferences from localStorage: ', e);
        }
    }

    /** Cleanup */
    destroy(): void {
        for (const id of this.activeSources.keys()) {
            this.stopSound(id);
        }
        this.stopMusic();

        if (this.context && this.context.state !== 'closed') {
            this.context.close();
        }
    }
}