<script lang="ts">
	import { onMount } from 'svelte';
	let data = [];
	$: data;

	onMount(async () => {
		data = await (await fetch('/api/workspaces/')).json();
	});
</script>

<p>Workspace list</p>
{#each data as item}
	{item.name}
{/each}
