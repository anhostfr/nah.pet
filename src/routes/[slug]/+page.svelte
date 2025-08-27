<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { Lock } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	let { data, form } = $props();
	let password = $state('');
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>Lien protégé - Nah.pet</title>
</svelte:head>

<div class="max-w-md mx-auto mt-16">
	<Card.Root>
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Lock class="h-8 w-8" />
			</div>
			<Card.Title>Lien protégé</Card.Title>
			<p class="text-sm text-muted-foreground">Ce lien est protégé par un mot de passe</p>
			{#if data?.link?.title}
				<p class="text-sm font-medium">{data.link.title}</p>
			{/if}
		</Card.Header>
		<Card.Content>
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
						<Label for="password">{m.password()}</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder={m.password_placeholder()}
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
							{m.verification_progress()}
						{:else}
							Accéder au lien
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
