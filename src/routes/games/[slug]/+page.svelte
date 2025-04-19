<script lang="ts">
    import { onMount, onDestroy} from 'svelte';
    import type { PageData } from './$types';
    import { page } from '$app/stores';

    export let data: PageData;

    let gameInstance: any = null;
    let gameContainer: HTMLDivElement;
    let canvas = HTMLCanvasElement;
    let isLoading = true;
    let error: string | null = null;
    let score = 0;
    let highScore = 0;
    let isPaused = false;
    let showSettingsModal = false;
    let showControlsModal = false;

    let settings = {
        soundEnabled: true,
        musicEnabled: true,
        volume: 0.7,
        difficulty: 'easy'
    };

    onMount(async () => {
        const slug = $page.params.slug;
        isLoading = true;

        try {
            const gameModule = await import(`$lib/games/${slug}/index.ts`);
            canvas = document.createElement('canvas');
            canvas.width = gameContainer.clientWidth;
            canvas.height = Math.min(window.innerHeight * 0.7, gameContainer.clientWidth * 0.75);
            canvas.id = 'game-canvas';
            gameContainer.appendChild(canvas);
            gameInstance = await gameModule.createGame(canvas.id, canvas.width, canvas.height);
            gameInstance.on('scoreChange', (data: any) => {
                score = data.score;
            });
            gameInstance.on('gameOver', (data: any) => {
                score = data.score;
                highScore = data.highScore;
            });

            const loadedSettings = gameInstance.getSettings();
            settings = { 
                ...settings, 
                ...loadedSettings 
                       };
            isLoading = false;

            window.addEventListener('resize', handleResize);
            gameInstance.start();
            
            
        } catch (err) {
            console.error('Failed to load game:', err);
            error = 'Failed to load game. Please try again later.';
            isLoading = false;
        }
    });

    onDestroy(() => {
        if (gameInstance) {
            gameInstance.destroy();
        }
        window.removeEventListener('resize', handleResize);
    })

    function handleResize() {
        if (!canvas || !gameInstance) {
            return;
        }
        const newWidth = gameContainer.clientWidth;
        const newHeight = Math.min(window.innerHeight * 0.7, gameContainer.clientHeight * 0.75);
        canvas.width = newWidth;
        canvas.height = newHeight;

        gameInstance.resize(newWidth, newHeight);
    }

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            gameInstance.resume();
            isPaused = false;
        } else {
            gameInstance.pause();
            isPaused = true;
        }
    }

    function restartGame() {
        if (!gameInstance) return;

        gameInstance.reset();
        gameInstance.start();
        isPaused = false;
    }

    function openSettings() {
        showSettingsModal = true;

        if (gameInstance && !isPaused) {
            gameInstance.pause();
            isPaused = true;
        }
    }

    function closeSettings() {
        showSettingsModal = false;
    }

    function saveSettings() {
        if (!gameInstance) return;
        gameInstance.applySettings(settings);
        showSettingsModal = false;
        if (isPaused) {
            gameInstance.resume();
            isPaused = false;
        }    
    }

    function openControls() {
        showControlsModal = true;
        if (gameInstance && !isPaused) {
            gameInstance.pause();
            isPaused = true;
        }
    }

    function closeControls() {
        showControlsModal = false;
        if (gameInstance && isPaused) {
            gameInstance.resume();
            isPaused = false;
        }
    }
</script>