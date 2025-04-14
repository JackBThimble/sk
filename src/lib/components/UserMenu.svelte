<script lang="ts">
	import { onMount } from 'svelte';
	import { clickOutside } from '$lib/actions/clickOutside';

	let user = $props();

	let isOpen = $state(false);
	function toggleMenu() {
		isOpen = !isOpen;
	}

	function handleLogout() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/logout';
		document.body.appendChild(form);
		form.submit();
	}
</script>

<div class="relative" use:clickOutside={() => (isOpen = false)}>
	<button
		onclick={toggleMenu}
		class="hover:bg-bg-tertiary flex items-center space-x-2 rounded-full"
	>
		<div class="bg-blue flex h-8 w-8 items-center justify-center rounded-full text-white">
			<span>{user?.username?.[0]?.toUpperCase() || '?'}</span>
		</div>
	</button>
	{#if isOpen}
		<div
			class="bg-bg-secondary border-border absolute right-0 z-20 mt-2 w-48 rounded-md border py-2 shadow-lg"
		>
			<div class="border-border border-b px-4 py-2">
				<p class="text-text-primary text-sm font-medium">{user?.username}</p>
			</div>
			<a href="/profile" class="text-text-primary hover:bg-tertiary block px-4 py-2 text-sm">
				Profile
			</a>
			<a href="/scores" class="text-text-primary hover:bg-bg-tertiary block px-4 py-2 text-sm"
				>My Scores</a
			>
			<button
				onclick={handleLogout}
				class="text-red hover:bg-bg-tertiary w-full px-4 py-2 text-left text-sm">Sign Out</button
			>
		</div>
	{/if}
</div>
