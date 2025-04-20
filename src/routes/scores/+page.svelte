<script lang="ts">
	import type { PageData } from './$types';

	let data = $props();
	let selectedGame = $state(data.games[0]?.id || '');

	// Filtered scores for the selected game
	let gameScores = $derived(data.scores.filter((score: any) => score.gameId === selectedGame));

	// Get game title
	let gameTitle = $derived(
		data.games.find((game: any) => game.id === selectedGame)?.title || 'Unknown Game'
	);

	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	// Check if a score belongs to the current user
	function isCurrentUserScore(userId: string): boolean {
		return data.user?.id === userId;
	}
</script>

<div class="mb-8">
	<h1 class="mb-6 text-4xl font-bold">High Scores</h1>

	<div class="mb-6">
		<label for="game-select" class="mb-2 block text-sm font-medium">Select Game:</label>
		<select
			id="game-select"
			bind:value={selectedGame}
			class="bg-bg-primary border-border w-full rounded-md border p-2 md:w-64"
		>
			{#each data.games as game}
				<option value={game.id}>{game.title}</option>
			{/each}
		</select>
	</div>

	<div class="bg-bg-secondary border-border overflow-hidden rounded-lg border">
		<div class="border-border border-b p-4">
			<h2 class="text-xl font-semibold">{gameTitle} - Top Scores</h2>
		</div>

		{#if gameScores.length === 0}
			<div class="p-8 text-center">
				<p class="text-text-secondary">No scores recorded for this game yet.</p>
				<a href="/games/{selectedGame}" class="btn-primary mt-4 inline-block">Play Now</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full">
					<thead>
						<tr class="bg-bg-tertiary border-border border-b">
							<th class="px-4 py-3 text-left">Rank</th>
							<th class="px-4 py-3 text-left">Player</th>
							<th class="px-4 py-3 text-right">Score</th>
							<th class="px-4 py-3 text-right">Date</th>
						</tr>
					</thead>
					<tbody>
						{#each gameScores as score, index}
							<tr
								class={`
                border-border border-b 
                ${isCurrentUserScore(score.userId) ? 'bg-blue bg-opacity-10' : ''}
                hover:bg-bg-tertiary
              `}
							>
								<td class="px-4 py-3">{index + 1}</td>
								<td class="px-4 py-3">
									<div class="flex items-center">
										<div
											class="bg-blue mr-2 flex h-8 w-8 items-center justify-center rounded-full text-white"
										>
											{score.user?.username?.[0]?.toUpperCase() || '?'}
										</div>
										<span>
											{score.user?.username || 'Unknown'}
											{#if isCurrentUserScore(score.userId)}
												<span class="text-blue ml-2 text-xs">(You)</span>
											{/if}
										</span>
									</div>
								</td>
								<td class="px-4 py-3 text-right font-mono font-semibold"
									>{score.score.toLocaleString()}</td
								>
								<td class="text-text-secondary px-4 py-3 text-right text-sm"
									>{formatDate(score.createdAt)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	{#if data.user}
		<div class="bg-bg-secondary border-border mt-6 overflow-hidden rounded-lg border">
			<div class="border-border border-b p-4">
				<h2 class="text-xl font-semibold">Your Personal Bests</h2>
			</div>

			{#if data.userBestScores.length === 0}
				<div class="p-8 text-center">
					<p class="text-text-secondary">You haven't recorded any scores yet.</p>
					<a href="/games" class="btn-primary mt-4 inline-block">Play Games</a>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full">
						<thead>
							<tr class="bg-bg-tertiary border-border border-b">
								<th class="px-4 py-3 text-left">Game</th>
								<th class="px-4 py-3 text-right">Best Score</th>
								<th class="px-4 py-3 text-right">Rank</th>
								<th class="px-4 py-3 text-right">Date</th>
							</tr>
						</thead>
						<tbody>
							{#each data.userBestScores as userScore}
								{@const game = data.games.find((g: any) => g.id === userScore.gameId)}
								<tr class="border-border hover:bg-bg-tertiary border-b">
									<td class="px-4 py-3">
										<a
											href="/games/{userScore.gameId}"
											class="text-blue flex items-center hover:underline"
										>
											{game?.title || 'Unknown Game'}
										</a>
									</td>
									<td class="px-4 py-3 text-right font-mono font-semibold"
										>{userScore.score.toLocaleString()}</td
									>
									<td class="px-4 py-3 text-right">
										{#if userScore.rank}
											#{userScore.rank}
										{:else}
											-
										{/if}
									</td>
									<td class="text-text-secondary px-4 py-3 text-right text-sm"
										>{formatDate(userScore.createdAt)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{:else}
		<div class="bg-bg-secondary border-border mt-6 rounded-lg border p-6 text-center">
			<h2 class="mb-2 text-xl font-semibold">Track Your Progress</h2>
			<p class="text-text-secondary mb-4">
				Sign in to save your scores and track your progress across all games.
			</p>
			<div class="flex justify-center gap-4">
				<a href="/login" class="btn-primary">Sign In</a>
				<a href="/register" class="btn-secondary">Create Account</a>
			</div>
		</div>
	{/if}
</div>
