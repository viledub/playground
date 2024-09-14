<script lang="ts">
    import { goto } from '$app/navigation';
	import { register } from '$lib/auth/auth';

    let error = '';
    let username = '';
    let email = '';
    let password = '';
    let passwordConfirm = '';

    async function handleRegister() {
        try {
            await register({email, password, passwordConfirm, username});
            goto('dashboard')
        } catch (err) {
            error = 'Registration failed: ' + err.message;
        }
    }
</script>

<div>
    <h1>Login</h1>
    <form on:submit|preventDefault={handleRegister}>
      <label>
        Email:
        <input type="email" name="email" bind:value={email} required />
      </label>
      <label>
        Username:
        <input type="text" name="username" bind:value={username} required />
      </label>
      <label>
        Password:
        <input type="password" name="password" bind:value={password} required />
      </label>
      <label>
        Password Confirm:
        <input type="password" name="password" bind:value={passwordConfirm} required />
      </label>
      {#if error}
        <p>{error}</p>
      {/if}
      <button type="submit">Register</button>
    </form>
  </div>