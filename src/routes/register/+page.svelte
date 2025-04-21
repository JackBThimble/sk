<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import ZodIssues from '$lib/components/ZodIssues.svelte';
	import { onMount } from 'svelte';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);
	let username = $state(form?.data?.username);
	let password = $state('');
	let confirmPassword = $state('');

	let usernameValid = $state(true);
	let passwordValid = $state(true);
	let confirmPasswordValid = $state(true);
	let passwordsMatch = $state(true);

	function validateUsername() {
		if (username) {
			usernameValid =
				username.length >= 3 && username.length <= 31 && /^[a-zA-Z0-9_-]+$/.test(username);
		} else {
			return false;
		}
	}
	function validatePassword() {
		passwordValid =
			password.length >= 8 &&
			password.length <= 255 &&
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
		validatePasswordsMatch();
	}

	function validatePasswordsMatch() {
		passwordsMatch = password === confirmPassword;
		confirmPasswordValid = confirmPassword.length > 0 && passwordsMatch;
	}

	const fieldIds: any = {
		username: 'username-field',
		password: 'password-field',
		confirmPassword: 'confirm-password-field'
	};
	const errorIds: any = {
		username: 'username-error',
		password: 'password-error',
		confirmPassword: 'confirm-password-error'
	};

	onMount(() => {
		if (form?.errors) {
			const firstErrorField = Object.keys(form.errors)[0];
			if (firstErrorField && firstErrorField != 'Form') {
				document.getElementById(fieldIds[firstErrorField])?.focus();
			}
		}
	});
</script>

<div class="bg-bg-secondary border-border mx-auto mt-16 max-w-md rounded-lg border p-6 shadow-md">
	<h1 class="text-text-primary mb-6 text-center text-2xl font-bold">Create an Account</h1>

	{#if form?.issues}
		<div
			class="bg-red bg-opacity-10 border-red text-red mb-4 rounded border p-3"
			role="alert"
			aria-live="assertive"
		>
			<ZodIssues issues={form.issues} />
		</div>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				isLoading = false;
				update();
			};
		}}
		novalidate
	>
		<div class="relative mb-6">
			<label for={fieldIds.username} class="text-text-secondary block text-sm font-medium">
				Username
			</label>
			<div class="relative mt-1">
				<input
					type="text"
					id={fieldIds.username}
					name="username"
					bind:value={username}
					oninput={validateUsername}
					onblur={validateUsername}
					class="bg-bg-primary border-border focus w-full rounded-md border p-2.5 pr-10
						{!usernameValid || form?.errors?.username
						? 'border-red focus:border-red focus:ring-red'
						: 'focus:border-blue focus:ring-blue'}"
					aria-invalid={!usernameValid || !!form?.errors?.username ? 'true' : 'false'}
					aria-describedby={!usernameValid || form?.errors?.username
						? errorIds.username
						: undefined}
					required
				/>
				{#if !usernameValid || form?.errors?.username}
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-red h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				{/if}
			</div>
			{#if form?.errors?.username}
				<p class="text-red mt-1 text-sm" id={errorIds.username}>{form.errors.username}</p>
			{:else if !usernameValid}
				<p class="text-red mt-1 text-sm" id={errorIds.username}>
					Username must be 3-31 characters and contain only lowercase letters, numbers,
					underscores, and hyphens
				</p>
			{/if}
			<p class="text-text-secondary mt-1 text-xs">
				3-31 characters, lowercase letters, numbers, underscores, and hyphens only
			</p>
		</div>

		<div class="relative mb-6">
			<label for={fieldIds.password} class="text-text-secondary block text-sm font-medium">
				Password
			</label>
			<div class="relative mt-1">
				<input
					type="password"
					id={fieldIds.password}
					name="password"
					bind:value={password}
					oninput={validatePassword}
					onblur={validatePassword}
					class="bg-bg-primary border-border w-full rounded-md border p-2.5 pr-10
						{!passwordValid || form?.errors?.password
						? 'border-red focus:border-red focus:ring-red'
						: 'focus:border-blue focus:ring-blue'}"
					aria-invalid={!passwordValid || !!form?.errors?.password ? 'true' : 'false'}
					aria-describedby={!passwordValid || form?.errors?.password
						? errorIds.password
						: undefined}
					required
				/>
				{#if !passwordValid || form?.errors?.password}
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-red h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				{/if}
			</div>
			{#if form?.errors?.password}
				<p class="text-red mt-1 text-sm" id={errorIds.password}>{form.errors.password}</p>
			{:else if !passwordValid && password.length > 0}
				<p class="text-red mt-1 text-sm" id={errorIds.password}>
					Password must be at least 6 characters with 1 uppercase letter, 1 lowercase
					letter, and 1 number
				</p>
			{/if}
			<p class="text-text-secondary mt-1 text-xs">
				At least 6 characters, with 1 uppercase letter, 1 lowercase letter, and 1 number
			</p>
		</div>

		<div class="relative mb-6">
			<label
				for={fieldIds.confirmPassword}
				class="text-text-secondary block text-sm font-medium"
			>
				Confirm Password
			</label>
			<div class="relative mt-1">
				<input
					type="password"
					id={fieldIds.confirmPassword}
					name="confirmPassword"
					bind:value={confirmPassword}
					oninput={validatePasswordsMatch}
					onblur={validatePasswordsMatch}
					class="bg-bg-primary border-border w-full rounded-md border p-2.5 pr-10
						{!confirmPasswordValid || !passwordsMatch || form?.errors?.confirmPassword
						? 'border-red focus:border-red focus:ring-red'
						: 'focus:border-blue focus:ring-blue'}"
					aria-invalid={!confirmPasswordValid ||
					!passwordsMatch ||
					!!form?.errors?.confirmPassword
						? 'true'
						: 'false'}
					aria-describedby={!confirmPasswordValid ||
					!passwordsMatch ||
					form?.errors?.confirmPassword
						? errorIds.confirmPassword
						: undefined}
					required
				/>
				{#if (!confirmPasswordValid && confirmPassword.length > 0) || !passwordsMatch || form?.errors?.confirmPassword}
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-red h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				{/if}
			</div>
			{#if form?.errors?.confirmPassword}
				<p class="text-red mt-1 text-sm" id={errorIds.confirmPassword}>
					{form.errors.confirmPassword}
				</p>
			{:else if !passwordsMatch && confirmPassword.length > 0}
				<p class="text-red mt-1 text-sm" id={errorIds.confirmPassword}>
					Passwords do not match
				</p>
			{/if}
		</div>

		<button
			type="submit"
			class="bg-blue hover:bg-blue-hover focus:ring-blue focus:ring-opacity-50 w-full rounded-md p-2.5 text-white focus:ring-2 focus:outline-none disabled:opacity-50"
			disabled={isLoading ||
				!usernameValid ||
				!passwordValid ||
				!confirmPasswordValid ||
				!passwordsMatch ||
				username?.length === 0 ||
				password?.length === 0 ||
				confirmPassword?.length === 0}
		>
			{#if isLoading}
				<span class="flex items-center justify-center">
					<svg
						class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
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
					Creating account...
				</span>
			{:else}
				Create Account
			{/if}
		</button>

		<div class="mt-4 text-center">
			<p class="text-text-secondary text-center text-sm">
				Already have an account? <a href="/login" class="text-blue hover:underline"
					>Log in</a
				>
			</p>
		</div>
	</form>
</div>

