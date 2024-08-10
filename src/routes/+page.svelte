<script lang="svelte">
import Card from "$lib/components/Cards/Card.svelte";
</script>
<h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>

  <Card>boop</Card>
  
  <style lang="postcss">
    :global(html) {
      background-color: theme(colors.pink.100);
    }
  </style>
  