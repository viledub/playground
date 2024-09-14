<script lang="ts">
    import { goto } from '$app/navigation';
	import { login } from '$lib/auth/auth';

    let error = '';
    let email = '';
    let password = '';

    async function handleLogin() {
        try {
            await login(email, password);
            goto('dashboard')
        } catch (err) {
            error = 'Login failed: ' + err.message;
        }
    }
</script>

<div>
    <h1>Login</h1>
    <form on:submit|preventDefault={handleLogin}>
      <label>
        Email:
        <input type="email" bind:value={email} required />
      </label>
      <label>
        Password:
        <input type="password" bind:value={password} required />
      </label>
      {#if error}
        <p>{error}</p>
      {/if}
      <button type="submit">Login</button>
    </form>
  </div>