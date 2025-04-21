<script lang="ts">
	interface Game {
		id: string;
		title: string;
		description: string | null;
		thumbnail: string | null;
		category: string;
		tags: string | null;
		difficulty: string;
		releaseDate: string | null;
		version: string | null;
		author: string | null;
	}

	let { game, userScore } = $props<{
		game: Game;
		userScore?: { score: number; rank?: number } | null;
	}>();

	let imageError = $state(false);
	//	let parsedTags = $derived(game.tags ? JSON.parse(game.tags) : []);

	// Function to get the difficulty color class
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

	function handleImageError() {
		imageError = true;
	}
</script>

<a
	href={`/games/${game.id}`}
	class="card group hover:bg-bg-tertiary transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
>
	<div class="bg-bg-tertiary relative mb-4 aspect-square overflow-hidden rounded-t-lg">
		{#if game.thumbnail && !imageError}
			{@const thumbnailPath = game.thumbnail.startsWith('/')
				? game.thumbnail
				: `/game-assets/${game.id}/assets/img/thumbnail.png`}
			<img
				src={thumbnailPath}
				alt={game.title}
				class="h-full w-full transform transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
				onerror={handleImageError}
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="text-text-secondary h-16 w-16 opacity-30"
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
					<circle cx="12" cy="12" r="3" stroke-width="2" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 9l6 6m0-6l-6 6"
					/>
				</svg>
			</div>
		{/if}

		<!-- Category Badge -->
		<span
			class="bg-blue bg-opacity-90 absolute top-2 right-2 rounded-full px-2 py-1 text-xs text-white"
		>
			{game.category}
		</span>

		<!-- User Score Badge (if available) -->
		{#if userScore}
			<div
				class="bg-green bg-opacity-90 absolute right-2 bottom-2 flex items-center rounded-full px-2 py-1 text-xs text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-3 w-3"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
				{userScore.score.toLocaleString()}
			</div>
		{/if}
	</div>

	<h2 class="mb-2 text-xl font-semibold">{game.title}</h2>

	<p class="text-text-secondary mb-3 line-clamp-2 text-sm">
		{game.description || 'No description available.'}
	</p>

	<div class="border-border mt-auto flex items-center justify-between border-t pt-2">
		<span class="text-sm">
			<span class="text-text-secondary">Difficulty: </span>
			<span class={`font-medium ${getDifficultyColor(game.difficulty)}`}>
				{game.difficulty}
			</span>
		</span>

		{#if game.releaseDate}
			<span class="text-text-secondary text-xs">
				Released: {new Date(game.releaseDate).toLocaleDateString()}
			</span>
		{/if}
	</div>
</a>
