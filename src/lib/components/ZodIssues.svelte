<script lang="ts">
	import type { ZodIssue } from 'zod';
	let { issues }: { issues: ZodIssue[] } = $props();

	const groupedIssues = $derived(
		issues.reduce(
			(groups, issue) => {
				const field = issue.path.length ? String(issue.path[0]) : 'form';
				if (!groups[field]) {
					groups[field] = [];
				}
				groups[field].push(issue);
				return groups;
			},
			{} as Record<string, ZodIssue[]>
		)
	);
	function formatFieldName(field: string): string {
		if (field === 'form') return 'Form';
		return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
	}
</script>

<div class="text-sm">
	<h3 class="mb-2 font-semibold">Please fix the following issues:</h3>
	{#each Object.entries(groupedIssues) as [field, issues]}
		<div class="mb-4">
			<h4 class="font-medium">{formatFieldName(field)}:</h4>
			<ul class="list-inside list-disc pl-2">
				{#each issues as issue}
					<li>{issue.message}</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>

