<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
	import { onMount } from 'svelte';
	import UserMenu from './UserMenu.svelte';

	let user = $props();

	let scrolled = $state(false);
	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header
	class="fixed top-0 right-0 left-0 z-10 w-full px-6 py-4 transition-all duration-300 {scrolled
		? 'bg-opacity-95 shadow-md backdrop-blur-sm'
		: 'bg-opacity-100'} bg-bg-primary border-border border-b shadow-sm transition-colors"
>
	<nav class="mx-auto flex max-w-7xl items-center justify-between">
		<div class="flex items-center">
			<a href="/" class="flex items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 transition-transform duration-300 ease-in-out group-hover:scale-110"
					viewBox="0 0 24 24"
					fill="none"
				>
					<!-- Retro Arcade Machine -->
					<rect x="4" y="3" width="16" height="18" rx="1" fill="var(--color-purple)" />
					<rect x="6" y="5" width="12" height="8" fill="var(--color-bg-primary)" />

					<!-- Screen Content: Pixel Art Space Invader -->
					<rect x="8" y="6" width="2" height="1" fill="var(--color-green)" />
					<rect x="14" y="6" width="2" height="1" fill="var(--color-green)" />
					<rect x="8" y="7" width="2" height="1" fill="var(--color-green)" />
					<rect x="14" y="7" width="2" height="1" fill="var(--color-green)" />
					<rect x="10" y="7" width="4" height="1" fill="var(--color-green)" />
					<rect x="8" y="8" width="8" height="1" fill="var(--color-green)" />
					<rect x="9" y="9" width="6" height="1" fill="var(--color-green)" />
					<rect x="10" y="10" width="1" height="1" fill="var(--color-green)" />
					<rect x="13" y="10" width="1" height="1" fill="var(--color-green)" />

					<!-- Control Panel -->
					<rect x="6" y="15" width="12" height="4" rx="1" fill="var(--color-blue)" />
					<circle cx="9" cy="17" r="1.5" fill="var(--color-red)" />
					<circle cx="15" cy="17" r="1.5" fill="var(--color-yellow)" />
					<rect x="13" cy="16" width="1" height="2" fill="var(--color-bg-primary)" />
					<rect x="16" cy="16" width="1" height="2" fill="var(--color-bg-primary)" />
				</svg>
			</a>
		</div>
		<div class="relative flex flex-1 justify-center">
			<h1 class="relative text-2xl font-bold">
				<span class="from-blue via-purple to-pink bg-gradient-to-r bg-clip-text text-transparent"
					>SK Game Hub</span
				>
				<span
					class="from-blue via-purple to-pink absolute right-0 -bottom-1.5 left-0 h-0.5 origin-left scale-x-0 transform rounded-full bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-100"
				></span>
			</h1>
		</div>
		<div class="flex items-center space-x-4">
			<ThemeToggle />
			{#if user}
				<UserMenu {user} />
			{:else}
				<a
					href="/login"
					class="bg-blue hover:bg-light-blue rounded-md px-4 py-2 text-white transition-colors"
					>Sign In</a
				>
			{/if}
		</div>
	</nav>
</header>
<div class="h-16"></div>
