<script>
    import { current } from "$lib/stores/user";
	import { logout } from "$lib/auth/auth";
	import { goto } from "$app/navigation";
  if(!$current) {
    goto('login');
  }
  </script>
  <!-- <div>protected</div> -->
  {#if $current}
    <div><h1>Current: {$current.email} - id: {$current.id}</h1> <button on:click={logout}>Logout</button></div> 
  {/if}
  <slot />