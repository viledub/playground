<script lang="svelte">
import Card from "$lib/components/Cards/Card.svelte";
export let data;
</script>
<h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>

  <Card>boop</Card>

  Data:
  {JSON.stringify(data.data.items)}
  
  <style lang="postcss">
    :global(html) {
      background-color: theme(colors.pink.100);
    }
  </style>
  