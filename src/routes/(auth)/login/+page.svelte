<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { Link } from 'lucide-svelte';
	import { goto, invalidate } from '$app/navigation';
	import { authClient } from '$lib/auth-client.js';

	let { form } = $props();
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let oauthLoading = $state(false);

	async function handleOAuthLogin() {
		try {
			oauthLoading = true;
			await authClient.redirectToAuth();
		} catch (err) {
			console.error('Erreur OAuth:', err);
			oauthLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Connexion - Nah.pet</title>
</svelte:head>

<div class="min-h-full bg-primary-foreground flex items-center justify-center">
	<Card.Root class="max-w-md w-full">
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
				<Link class="h-8 w-8 text-primary-foreground" />
			</div>
			<Card.Title>Connexion</Card.Title>
			<p class="text-sm text-muted-foreground">Connectez-vous à votre compte Nah.pet</p>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.redirectTo) {
							await invalidate('app:auth');
							goto(result.data.redirectTo as string);
						} else {
							await update();
						}
						isLoading = false;
					};
				}}
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="votre@email.com"
							bind:value={email}
							required
							autofocus
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Mot de passe</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Votre mot de passe"
							bind:value={password}
							required
						/>
					</div>

					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{/if}

					<Button type="submit" disabled={isLoading || !email || !password} class="w-full">
						{#if isLoading}
							Connexion...
						{:else}
							Se connecter
						{/if}
					</Button>
				</div>
			</form>

			<div class="relative mt-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-card text-muted-foreground">ou</span>
				</div>
			</div>

			<div class="mt-6">
				<Button variant="outline" class="w-full" onclick={handleOAuthLogin} disabled={oauthLoading}>
					{#if oauthLoading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
					{:else}
						<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
							/>
						</svg>
					{/if}
					Se connecter avec Anhost
				</Button>
			</div>

			<div class="mt-6 text-center text-sm">
				<p class="text-muted-foreground">
					Pas encore de compte ?
					<a href="/register" class="text-primary hover:underline"> S'inscrire </a>
				</p>
			</div>

			<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />
			<div class="text-center text-sm text-gray-500 dark:text-gray-400">
				<p>© {new Date().getFullYear()} Nah.pet — It’s a no from us, dawg.</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
