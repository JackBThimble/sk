<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps } from './$types';
	import type { Action } from 'svelte/action';
	import type { SvelteHTMLElements } from 'svelte/elements';

	let { form, data }: PageProps = $props();

	let gameContainer: HTMLDivElement | undefined = $state();

	let canvas: HTMLCanvasElement | undefined = $state();
	let gameInstance: any = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let score = $state(0);
	let highScore = $state(0);
	let isPaused = $state(false);
	let showSettingsModal = $state(false);
	let showControlsModal = $state(false);

	let settings = $state({
		soundEnabled: true,
		musicEnabled: true,
		volume: 0.7,
		difficulty: 'medium'
	});

	onMount(async () => {
		isLoading = true;

		try {
			const gameModule = await import(`../../../games/${data.game.id}/index.ts`);

			if (gameContainer && canvas) {
				console.log('Fucking game container is null...');
				canvas = document.createElement('canvas');
				canvas.width = gameContainer.clientWidth || window.innerWidth * 0.7;
				canvas.height = Math.min(window.innerHeight * 0.7, gameContainer.clientHeight * 0.75);
				canvas.id = 'game-canvas';
				gameContainer.appendChild(canvas);
				// init game
				gameInstance = await gameModule.createGame(canvas.id, canvas.width, canvas.height);
			}

			// set up event listeners
			gameInstance.on('scoreChange', (eventData: any) => {
				score = eventData.score;
			});

			gameInstance.on('gameOver', (eventData: any) => {
				score = eventData.score;
				highScore = eventData.highScore;
			});

			// load game settings
			const loadedSettings = gameInstance.getSettings();
			settings = { ...settings, ...loadedSettings };

			isLoading = false;

			window.addEventListener('resize', handleResize);

			gameInstance.start();
		} catch (e) {
			console.error('Failed to load game:', e);
			error = 'Failed to load game. Please try again later.';
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (gameInstance) {
			gameInstance.destroy();
		}
	});

	function handleResize() {
		if (!canvas || !gameInstance || !gameContainer) return;

		const newWidth = gameContainer.clientWidth;
		const newHeight = Math.min(window.innerHeight * 0.7, gameContainer.clientHeight * 0.75);

		canvas.width = newWidth;
		canvas.height = newHeight;

		gameInstance.resize(newWidth, newHeight);
	}

	function togglePause() {
		if (gameInstance) {
			if (isPaused) {
				gameInstance.resume();
				isPaused = false;
			} else {
				gameInstance.pause();
				isPaused = true;
			}
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

	function closeModals() {
		showSettingsModal = false;
		showControlsModal = false;

		if (gameInstance && isPaused) {
			gameInstance.resume();
			isPaused = false;
		}
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty.toLowerCase()) {
			case 'easy':
				return 'text-green';
			case 'medium':
				return 'text-light-blue';
			case 'hard':
				return 'text-orange';
			case 'expert':
				return 'text-deep-orange';
			case 'master':
				return 'text-deep-red';
			default:
				return '';
		}
	}

	const controls = data.game.controls
		? JSON.parse(data.game.controls)
		: { keyboard: [], touch: [] };
</script>

<svelte:window onresize={handleResize} />
<div class="mb-12">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{data.game.title}</h1>
			<a href="/games" class="btn-secondary"> Back to Games </a>
		</div>

		<div class="mt-2 mb-4 flex flex-wrap items-center gap-3">
			<span class="bg-blue rounded-full px-3 py-1 text-sm text-white">
				{data.game.category}
			</span>

			<span
				class={`rounded-full border px-3 py-1 text-sm ${getDifficultyColor(data.game.difficulty)}`}
			>
				{data.game.difficulty}
			</span>

			{#if data.game.tags}
				{#each JSON.parse(data.game.tags) as tag}
					<span class="bg-bg-tertiary border-border rounded-full border px-3 py-1 text-sm">
						{tag}
					</span>
				{/each}
			{/if}
			<!-- Controls Modal -->
			{#if showControlsModal}
				<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
					<div class="bg-bg-primary border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-xl font-bold">Game Controls</h2>
							<button
								class="text-text-secondary hover:text-text-primary rounded-full p-1"
								onclick={() => (showControlsModal = false)}
								aria-label="controls"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="space-y-4">
							{#if controls.keyboard && controls.keyboard.length > 0}
								<div>
									<h3 class="mb-2 font-medium">Keyboard Controls:</h3>
									<ul class="ml-5 list-disc space-y-1">
										{#each controls.keyboard as control}
											<li>{control}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if controls.touch && controls.touch.length > 0}
								<div>
									<h3 class="mb-2 font-medium">Touch Controls:</h3>
									<ul class="ml-5 list-disc space-y-1">
										{#each controls.touch as control}
											<li>{control}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if (!controls.keyboard || controls.keyboard.length === 0) && (!controls.touch || controls.touch.length === 0)}
								<p class="text-text-secondary italic">
									No specific control instructions available for this game.
								</p>
							{/if}
						</div>

						<div class="mt-6 flex justify-end">
							<button class="btn-primary" onclick={() => (showControlsModal = false)}>
								Close
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
		<p class="text-text-secondary mb-6">
			{data.game.description || 'No description available.'}
		</p>
	</div>

	<div class="flex flex-col gap-6 lg:flex-row">
		<div class="flex-1">
			{#if isLoading}
				<div
					class="bg-bg-secondary border-border flex h-96 items-center justify-center rounded-lg border"
				>
					<div class="text-center">
						<svg
							class="text-blue mx-auto h-12 w-12 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="text-text-secondary mt-4">Loading game...</p>
					</div>
				</div>
			{:else if error}
				<div
					class="bg-bg-secondary border-border flex h-96 items-center justify-center rounded-lg border"
				>
					<div class="text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-red mx-auto h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<p class="text-red mt-4">{error}</p>
						<button class="btn-secondary mt-4" onclick={() => window.location.reload()}>
							Try Again
						</button>
					</div>
				</div>
			{:else}
				<div
					bind:this={gameContainer}
					id="game-container"
					class="bg-bg-secondary border-border relative rounded-lg border"
				>
					<canvas bind:this={canvas}>
						<!--- Game controls overlay -->
						<div class="absolute top-2 right-2 z-10 flex gap-2">
							<button
								class="bg-bg-tertiary hover:bg-bg-primary rounded-full p-2 transition-colors"
								onclick={togglePause}
								title={isPaused ? 'Resume Game' : 'Pause Game'}
							>
								{#if isPaused}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								{/if}
							</button>
							<button
								class="bg-bg-tertiary hover:bg-bg-primary rounded-full p-2 transition-colors"
								onclick={openSettings}
								title="Game Settings"
								aria-label="settings"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
							<button
								class="bg-bg-tertiary hover:bg-bg-primary rounded-full p-2 transition-colors"
								onclick={openControls}
								title="Game Controls"
								aria-label="controls"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
									/>
								</svg>
							</button>
						</div>

						<!-- Score Display -->
						<div class="absolute bottom-2 left-2 z-10 text-sm">
							<div class="flex gap-4">
								<div>
									<span class="text-text-secondary">Score:</span>
									<span class="text-text-primary font-bold">{score}</span>
								</div>
								<div>
									<span class="text-text-secondary">High Score:</span>
									<span class="text-text-primary font-bold">{highScore}</span>
								</div>
							</div>
						</div>
					</canvas>
				</div>
			{/if}
		</div>

		<div class="w-full lg:w-72">
			<div class="bg-bg-secondary border-border rounded-lg border p-4">
				<h2 class="mb-4 text-lg font-semibold">Game Info</h2>
				<div class="space-y-3">
					<div>
						<h3 class="text-text-secondary text-sm">Author</h3>
						<p>{data.game.author || 'Unknown'}</p>
					</div>

					<div>
						<h3 class="text-text-secondary text-sm">Version</h3>
						<p>{data.game.version || '1.0.0'}</p>
					</div>

					<div>
						<h3 class="text-text-secondary text-sm">Release Date</h3>
						<p>
							{data.game.releaseDate
								? new Date(data.game.releaseDate).toLocaleDateString()
								: 'Unknown'}
						</p>
					</div>

					<div>
						<h3 class="text-text-secondary text-sm">Controls</h3>
						<button
							class="text-blue hover:text-light-blue transition-colors hover:underline"
							onclick={openControls}
						>
							View Controls
						</button>
					</div>

					<div>
						<h3 class="text-text-secondary text-sm">Settings</h3>
						<button
							class="text-blue hover:text-light-blue transition-colors hover:underline"
							onclick={openSettings}>Game Settings</button
						>
					</div>
				</div>
			</div>

			{#if data.user}
				<div class="bg-bg-secondary border-border mt-4 rounded-lg border p-4">
					<h2 class="mb-4 text-lg font-semibold">Your Stats</h2>

					<div class="space-y-3">
						<div>
							<h3 class="text-text-secondary text-sm">Best Score</h3>
							<p class="text-xl font-bold">{data.userBestScore || 0}</p>
						</div>

						<div>
							<h3 class="text-text-secondary text-sm">Times played</h3>
							<p>{data.userPlayCount || 0}</p>
						</div>

						<div>
							<h3 class="text-text-secondary text-sm">Rank</h3>
							<p>{data.userRank ? `#${data.userRank}` : 'Not ranked'}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!--  Settings Modal -->
{#if showSettingsModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="bg-bg-primary border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold">Game Settings</h2>
				<button
					class="text-text-secondary hover:text-text-primary rounded-full p-1"
					onclick={() => (showSettingsModal = false)}
					aria-label="settings"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label class="inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							bind:checked={settings.soundEnabled}
							class="form-checkbox bg-bg-primary border-border text-blue rounded"
						/>
						<span class="ml-2">Sound Effects</span>
					</label>
				</div>

				<div>
					<label class="inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							bind:checked={settings.musicEnabled}
							class="form-checkbox bg-bg-primary border-border text-blue rounded"
						/>
						<span class="ml-2">Background Music</span>
					</label>
				</div>

				<div>
					<label for="volume-slider" class="mb-2 block"
						>Volume: {(settings.volume * 100).toFixed(0)}%</label
					>
					<input
						id="volume-slider"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={settings.volume}
						class="w-full"
					/>
				</div>

				<div>
					<label for="difficulty-select" class="mb-2 block">Difficulty:</label>
					<select
						id="difficulty-select"
						bind:value={settings.difficulty}
						class="bg-bg-primary border-border w-full rounded-md border p-2"
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
						<option value="expert">Expert</option>
						<option value="master">Master</option>
					</select>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button class="btn-secondary" onclick={() => (showSettingsModal = false)}> Cancel </button>
				<button class="btn-primary" onclick={saveSettings}> Save Settings </button>
			</div>
		</div>
	</div>
{/if}
