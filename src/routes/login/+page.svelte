<script lang="ts">
	import { goto } from '$app/navigation';

	let message = '';
	async function handleSubmit(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		const object = {};
		formData.forEach((value, key) => (object[key] = value));
		console.log(object);
		const response = await fetch('/login', { method: 'POST', body: JSON.stringify(object) });
		const result = await response.json();
		message = result.message;
		goto('/workspaces');
	}
</script>

{message}
<form on:submit|preventDefault={handleSubmit}>
	<label for="username">Username</label>
	<input name="username" type="text" />
	<label for="password">Password</label>
	<input name="password" type="password" />
	<button type="submit">Submit</button>
</form>
