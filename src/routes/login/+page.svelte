<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let isLoading = $state(false);
</script>

<div class="bg-bg-secondary border-border mx-auto mt-16 max-w-md rounded-lg border p-6 shadow-md">
	<h1 class="text-text-primary mb-6 text-center text-2xl font-bold">Sign In</h1>
	{#if form?.message}
		<div class="bg-red bg-opacity-10 border-red text-red mb-4 rounded border p-3">
			{form.message}
		</div>
	{/if}

	<form
		method="post"
		action="?/login"
		use:enhance={() => {
			isLoading = true;
			return async ({ result }) => {
				isLoading = false;
				if (result.type === 'failure') {
					console.error('Form error:', result);
				} else if (result.type === 'success') {
					window.location.href = '/';
				} else if (result.type === 'redirect') {
					goto(result.location);
				}
			};
		}}
	>
		<div class="mb-4">
			<label for="username" class="text-text-secondary block text-sm font-medium">Username</label>
			<input
				type="text"
				id="username"
				name="username"
				class="bg-bg-primary border-border focus:ring-blue focus:border-blue w-full rounded-md border p-2.5"
				required
			/>
		</div>

		<div class="mb-4">
			<label for="password" class="text-text-primary block text-sm font-medium">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				class="bg-bg-primary border-border focus:ring-blue focus:border-blue w-full rounded-md border p-2.5"
				required
			/>
		</div>
		<button
			type="submit"
			disabled={isLoading}
			class="bg-blue hover:bg-light-blue focus:ring-blue focus:ring-opacity-25 w-full rounded-md py-2.5 text-white transition-colors focus:ring-4 disabled:opacity-70"
		>
			{#if isLoading}
				<span class="flex items-center justify-center">
					<svg
						class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Signing in...
				</span>
			{:else}
				Sign In
			{/if}
		</button>
		<div class="mt-4 text-center">
			<p class="text-text-secondary text-sm">
				Don't have an accoutn? <a href="/register" class="text-blue hover:underline">Register</a>
			</p>
		</div>
	</form>
</div>
