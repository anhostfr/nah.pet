<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { UserPlus } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { form } = $props();
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>Inscription - ShortURL</title>
</svelte:head>

<div class="min-h-full bg-primary-foreground flex items-center justify-center">
	<Card class="max-w-md w-full">
		<CardHeader class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
				<UserPlus class="h-8 w-8 text-primary-foreground" />
			</div>
			<Card.Title>Inscription</Card.Title>
			<p class="text-sm text-muted-foreground">Créez votre compte ShortURL gratuit</p>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
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
							placeholder="Minimum 8 caractères"
							bind:value={password}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirmer le mot de passe</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="Répétez votre mot de passe"
							bind:value={confirmPassword}
							required
						/>
					</div>

					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{/if}

					<Button
						type="submit"
						disabled={isLoading || !email || !password || !confirmPassword}
						class="w-full"
					>
						{#if isLoading}
							Création du compte...
						{:else}
							Créer mon compte
						{/if}
					</Button>
				</div>
			</form>

			<div class="mt-6 text-center text-sm">
				<p class="text-muted-foreground">
					Déjà un compte ?
					<a href="/login" class="text-primary hover:underline"> Se connecter </a>
				</p>
			</div>

			<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />
			<div class="text-center text-sm text-gray-500 dark:text-gray-400">
				<p>© {new Date().getFullYear()} Nah.pet -  Links be like: “Nah, I'd redirect.”</p>
			</div>
		</Card.Content>
	</Card.Root
</div>
