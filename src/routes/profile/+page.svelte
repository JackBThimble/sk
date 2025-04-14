<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: user = data.user;
</script>

<div class="bg-bg-secondary border-border rounded-lg border p-8 shadow-md">
	<h1 class="text-text-primary mb-6 text-2xl font-bold">Profile</h1>

	<div class="mb-6 flex items-center">
		<div
			class="bg-blue mr-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
		>
			{user?.username?.[0]?.toUpperCase() || '?'}
		</div>
		<div>
			<h2 class="text-text-primary text-xl font-semibold">{user?.username}</h2>
			<p class="text-text-secondary text-sm">User ID: {user?.id}</p>
		</div>
	</div>

	<div class="border-border mb-6 border-b pb-6">
		<h3 class="text-text-primary mb-2 font-medium">Account Information</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<p class="text-text-secondary text-sm">Username</p>
				<p class="text-text-primary">{user?.username}</p>
			</div>
		</div>
	</div>

	<!--- Placeholder for future profile settings -->
	<div class="mb-6">
		<h3 class="text-text-primary mb-4 font-medium">Profile Settings</h3>
		<p class="text-text-secondary italic">More profile settings will be available soon.</p>
	</div>
	<div class="flex justify-end">
		<a
			href="/"
			class="bg-blue hover:bg-light-blue rounded-md px-4 py-2 text-white transition-colors"
		>
			Back to Home
		</a>
	</div>
</div>
