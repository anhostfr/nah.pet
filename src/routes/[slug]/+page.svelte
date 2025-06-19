<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { Lock } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { data, form } = $props();
	let password = $state('');
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>Lien protégé - ShortURL</title>
</svelte:head>

<div class="max-w-md mx-auto mt-16">
	<Card>
		<CardHeader class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Lock class="h-8 w-8" />
			</div>
			<CardTitle>Lien protégé</CardTitle>
			<p class="text-sm text-muted-foreground">Ce lien est protégé par un mot de passe</p>
			{#if data.link.title}
				<p class="text-sm font-medium">{data.link.title}</p>
			{/if}
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				action="?/verify"
				use:enhance={() => {
					isLoading = true;
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.redirectTo) {
							goto(result.data.redirectTo as string);
						} else {
							await update();
						}
						isLoading = false;
					};
				}}
			>
				<div class="space-y-4">
					<div>
						<Label for="password">Mot de passe</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Entrez le mot de passe"
							bind:value={password}
							required
							autofocus
						/>
					</div>

					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{/if}

					<Button type="submit" disabled={isLoading || !password} class="w-full">
						{#if isLoading}
							Vérification...
						{:else}
							Accéder au lien
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
