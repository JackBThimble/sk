<script lang="ts">
	import type { PageData } from './$types';
	import GameCard from '$lib/components/GameCard.svelte';

	let data: PageData = $props();
</script>

<div class="space-y-12">
	<!-- Hero Section -->
	<section class="bg-bg-secondary border-border mb-8 rounded-lg border p-8 md:p-12">
		<div class="mx-auto max-w-3xl text-center">
			<h1 class="mb-4 text-4xl font-bold sm:text-5xl">Welcome to SK Game Hub</h1>

			<p class="text-text-secondary mb-8 text-lg">
				Your one-stop platform for classic and modern browser games. Play, compete, and
				track your high scores across multiple games.
			</p>

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a href="/games" class="btn-primary px-8 py-3 text-lg">Browse Games</a>
				{#if !data.user}
					<a href="/register" class="btn-secondary px-8 py-3 text-lg">Create Account</a>
				{:else}
					<a href="/scores" class="btn-secondary px-8 py-3 text-lg">View Scores</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- Featured Game Section -->
	<section class="mb-12">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold">Featured Games</h2>
			<a
				href="/games"
				class="text-blue hover:text-light-blue transition-colors hover:underline"
			>
				View All Games
			</a>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.featuredGames as game}
				<GameCard
					{game}
					userScore={data.userScores?.find((score) => score.gameId === game.id)}
				/>
			{/each}
		</div>
	</section>

	<!-- Recent Scores Section -->
	{#if data.recentScores && data.recentScores.length > 0}
		<section class="mb-12">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold">Recent High Scores</h2>
				<a
					href="/scores"
					class="text-blue hover:text-light-blue transition-colors hover:underline"
				>
					View All Scores
				</a>
			</div>

			<div class="bg-bg-secondary border-border overflow-hidden rounded-lg border">
				<table class="min-w-full">
					<thead>
						<tr class="bg-bg-tertiary border-border border-b">
							<th class="px-4 py-3 text-left">Player</th>
							<th class="px-4 py-3 text-left">Game</th>
							<th class="px-4 py-3 text-right">Score</th>
							<th class="px-4 py-3 text-right">Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentScores as score}
							{@const game = data.games.find((g) => g.id === score.gameId)}
							<tr class="border-border hover:bg-bg-tertiary border-b">
								<td class="px-4 py-3">
									<div class="flex items-center">
										<div
											class="bg-blue mr-2 flex h-6 w-6 items-center justify-center rounded-full text-sm text-white"
										>
											{score.user?.username[0]?.toUpperCase() || '?'}
										</div>
										<span>
											{score.user?.username || 'Unknown'}
											{#if data.user && data.user.id === score.userId}
												<span class="text-blue ml-2 text-xs">(You)</span>
											{/if}
										</span>
									</div>
								</td><td class="px-4 py-3">
									<a
										href="/games/{score.gameId}"
										class="text-blue hover:underline"
									>
										{game?.title || 'Unknown Game'}
									</a>
								</td>
								<td class="px-4 py-3 text-right font-mono font-semibold"
									>{score.score.toLocaleString()}</td
								>
								<td class="text-text-secondary px-4 py-3 text-right text-sm">
									{new Date(score.createdAt).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- Call to Action for Non-Authenticated Users -->
	{#if !data.user}
		<section class="bg-bg-secondary border-border rounded-lg border p-8 text-center">
			<h2 class="mb-4 text-2xl font-bold">Create an Account to Save Your Progress</h2>
			<p class="text-text-secondary mx-auto mb-8 max-w-2xl">
				Sign up today to track your high scores, compete with other players, and unlock
				additional features in your favorite games.
			</p>
			<div class="flex justify-center gap-4">
				<a href="/register" class="btn-primary px-6 py-2">Register Now</a>
				<a href="/login" class="btn-secondary px-6 py-2">Sign In</a>
			</div>
		</section>
	{/if}
</div>
