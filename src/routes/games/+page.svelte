<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameCategory } from '../../games/core/types';
	import GameCard from '$lib/components/GameCard.svelte';
	import type { Game } from '$lib/server/db/schema';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedDifficulty = $state('all');

	let filteredGames = $derived(
		data.games.filter((game: Game) => {
			if (
				searchQuery &&
				!game.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!game.description?.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			if (
				selectedCategory !== 'all' &&
				game.category.toLowerCase() !== selectedCategory.toLowerCase()
			)
				return false;

			if (
				selectedDifficulty !== 'all' &&
				game.difficulty.toLowerCase() !== selectedCategory.toLowerCase()
			)
				return false;

			return true;
		})
	);

	let categories: any[] = $derived(['all', ...new Set(data.games.map((game) => game.category))]);

	let difficulties: any[] = $derived([
		'all',
		...new Set(data.games.map((game: any) => game.difficulty))
	]);

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

<div class="mb-8">
	<h1 class="mb-6 text-4xl font-bold">Game Library</h1>

	<div class="mb-6 flex flex-col gap-4 md:flex-row">
		<!-- Search Box -->
		<div class="flex-1">
			<div class="relative">
				<input
					type="text"
					placeholder="Search games..."
					bind:value={searchQuery}
					class="bg-bg-primary border-border w-full rounded-md border px-4 py-2 pl-10"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="text-text-secondary absolute top-2.5 left-3 h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
		</div>

		<!-- Category Filter -->
		<div class="w-full md:w-48">
			<select
				bind:value={selectedCategory}
				class="bg-bg-primary border-border w-full rounded-md px-4 py-2"
			>
				{#each categories as category}
					<option value={category}
						>{category === 'all'
							? 'All Categories'
							: category.charAt(0).toUpperCase() + category.slice(1)}</option
					>
				{/each}
			</select>
		</div>

		<!-- Difficulty Filter -->
		<div class="w-full md:w-48">
			<select
				bind:value={selectedDifficulty}
				class="bg-bg-primary border-border w-full rounded-md px-4 py-2"
			>
				{#each difficulties as difficulty}
					<option value={difficulty}>
						{difficulty === 'all'
							? 'AllDifficulties'
							: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
					</option>
				{/each}
			</select>
		</div>
	</div>

	{#if !filteredGames}
		<div class="py-16 text-center">
			<p class="text-text-secondary text-lg">No games found matching your criteria.</p>
			{#if searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'}
				<button
					class="btn-secondary mt-4"
					onclick={() => {
						searchQuery = '';
						selectedCategory = 'all';
						selectedDifficulty = 'all';
					}}
				>
					Clear Filters
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredGames as game}
				<GameCard {game} userScore={data.userScores.find((score) => score.gameId === game.id)} />
			{/each}
		</div>
	{/if}
</div>
