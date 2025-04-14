<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
  import ZodIssues from '$lib/components/ZodIssues.svelte';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordsMatch = $state(true);

	function validatePasswordsMatch() {
		passwordsMatch = password === confirmPassword;
	}
</script>

<div class="bg-bg-secondary border-border mx-auto mt-16 max-w-md rounded-lg border p-6 shadow-md">
	<h1 class="text-text-primary mb-6 text-center text-2xl font-bold">Create an Account</h1>
	{#if form?.message}
		<div class="bg-red bg-opacity-10 border-red text-red mb-4 rounded border p-3">
			{form.message}
		</div>
	{/if}
	<form
		method="post"
		action="/register"
		use:enhance={() => {
			isLoading = true;
			return async ({ result, update }) => {
				isLoading = false;
				update();
			};
		}}
	>
		<div class="mb-4">
			<label for="username" class="text-text-secondary block text-sm font-medium">Username</label>
			<input
				type="text"
				id="username"
				name="username"
				value={form?.data?.username || ''}
				class="bg-bg-primary border-border focus w-full rounded-md border p-2.5"
				required
			/>
			{#if form?..username}
				<p class="text-red mt-1 text-sm">{form.errors.username}</p>
			{/if}
		</div>
		<div class="mb-4">
			<label for="password" class="text-text-secondary block text-sm font-medium">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				class="bg-bg-primary border-border focus:ring-blue focus:border-blue w-full rounded-md border p-2.5"
				required
			/>
			{#if form?.errors?.password}
				<p class="text-red mt-1 text-sm">{form.errors.password}</p>
			{/if}
			<p class="text-text-secondary mt-1 text-xs">
				At lease 8 characters, with 1 uppercase letter, 1 lowercase letter, and 1 number
			</p>
		</div>
		<div class="mb-6">
			<label for="confirmPassword" class="text-text-secondary block text-sm font-medium"
				>Confirm Password</label
			>
			<input
				type="password"
				id="confirmPassword"
				name="confirmPassword"
				class="bg-bg-primary border-border focus:ring-blue focus:border-blue w-full rounded-md border p-2.5"
				required
			/>
			{#if !passwordsMatch}
				<p class="text-red mt-1 text-center text-sm">Passwords do not match</p>
			{/if}

			{#if form?.errors?.confirmPassword}
				<p class="text-red mt-1 text-sm">{form.errors.confirmPassword}</p>
			{/if}
		</div>
		<button
			type="submit"
			class="bg-blue hover:bg-blue-hover focus:ring-blue focus:ring-opacity-50 w-full rounded-md p-2.5 text-white focus:ring-2 focus:outline-none disabled:opacity-50"
			disabled={isLoading || !passwordsMatch}
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
					Creating account...
				</span>
			{:else}
				Create Account
			{/if}
		</button>
		<div class="mt-4 text-center">
			<p class="text-text-secondary text-center text-sm">
				Already have an account? <a href="/login" class="text-blue hover:underline">Log in</a>
			</p>
		</div>
	</form>
</div>
