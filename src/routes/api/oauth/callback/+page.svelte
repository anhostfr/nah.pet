<script>
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (data?.success && data?.redirectTo) {
			invalidate('app:auth').then(() => {
				goto(data.redirectTo);
			});
		} else {
			setTimeout(() => {
				loading = false;
			}, 3000);
		}
	});
</script>

<div class="fixed inset-0 flex items-center justify-center min-h-screen">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			{#if loading}
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
				<h2 class="mt-6 text-xl font-medium">Connexion en cours...</h2>
				<p class="mt-2 text-sm">Veuillez patienter pendant que nous finalisons votre connexion.</p>
			{:else if error}
				<div>
					<h2 class="text-xl font-medium">Erreur de connexion</h2>
					<p class="my-1 text-sm">{error}</p>
					<Button onclick={() => goto('/login')} class="">Retourner à la page de connexion</Button>
				</div>
			{:else}
				<div>
					<h2 class="text-xl font-medium">Connexion réussie</h2>
					<p class="my-1 text-sm text-secondary">Redirection en cours...</p>
				</div>
			{/if}
		</div>
	</div>
</div>
