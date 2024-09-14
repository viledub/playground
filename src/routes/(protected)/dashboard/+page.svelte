<script lang="ts">

export let data;
console.log(data);
</script>

<div class="h-full flex flex-col justify-center sm:mx-auto sm:w-full sm:max-w-sm">
    <div>Protected</div>
    <div>{data.items[0].content.test}</div>

    
</div>