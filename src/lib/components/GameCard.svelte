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

	let parsedTags = $derived(game.tags ? JSON.parse(game.tags) : []);

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
</script>

<a
	href={`/games/${game.id}`}
	class="card group hover:bg-bg-tertiary transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
>
	<div
		class="game-thumbnail bg-bg-tertiary relative mb-4 aspect-video overflow-hidden rounded-t-lg"
	>
		{#if game.thumbnail}
			{@const thumbnailPath = game.thumbnail.startsWith('/')
				? game.thumbnail
				: `/game-assets/${game.id}/assets/img/thumbnail.png`}
			<img
				src={thumbnailPath}
				alt={game.title}
				class="h-full w-full transform object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
				onerror={() => {
					this.onerror = null;
					this.src = '/placeholder-game.png';
				}}
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
						d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
