<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { Lock, Smartphone, ExternalLink } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { tKey } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';
	import type { NormalizedActionData } from '$lib/types';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: ActionData & NormalizedActionData } = $props();
	let password = $state('');
	let isLoading = $state(false);
	let hasRedirected = $state(false);

	onMount(() => {
		if (data.isDeepLink && data.deepLink) {
			hasRedirected = true;
			window.location.href = data.deepLink;
		}
	});

	function openInApp() {
		if (data.deepLink) {
			window.location.href = data.deepLink;
		}
	}

	function openInBrowser() {
		if (data.originalUrl) {
			window.location.href = data.originalUrl;
		}
	}

	$effect(() => {
		if (form && form.success === false) {
			password = '';
			toast.error(tKey(form.messageKey, form));
		} else if (form && form.success && form.isDeepLink) {
			if (form.deepLink) {
				window.location.href = form.deepLink;
			} else {
				window.location.href = form.originalUrl;
			}
		}
	});
</script>

<svelte:head>
	{#if data.deepLink}
		<meta http-equiv="refresh" content="3;url={data.deepLink}" />
	{/if}
	<title>{m.protected_link()} - Nah.pet</title>
</svelte:head>

<noscript>
	{#if data.isDeepLink && data.originalUrl}
		<meta http-equiv="refresh" content="0;url={data.originalUrl}" />
	{/if}
</noscript>

<div class="max-w-md mx-auto mt-16">
	{#if data.isDeepLink}
		<Card.Root>
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
				>
					<Smartphone class="h-8 w-8 text-primary" />
				</div>
				<Card.Title>{m.opening_in_app()}</Card.Title>
				{#if data.deepLink && !hasRedirected}
					<p class="text-sm text-muted-foreground">
						{m.redirect_to_app()}
					</p>
				{/if}
				{#if data.title}
					<p class="text-sm font-medium mt-2">{data.title}</p>
				{/if}
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if data.deepLink}
					<Button onclick={openInApp} class="w-full">
						<Smartphone class="mr-2 h-4 w-4" />
						{m.open_in_app()}
					</Button>
				{/if}

				<Button onclick={openInBrowser} variant="outline" class="w-full">
					<ExternalLink class="mr-2 h-4 w-4" />
					{m.open_in_browser()}
				</Button>

				{#if hasRedirected}
					<div class="text-center">
						<p class="text-sm text-muted-foreground">{m.app_not_opened()}</p>
						<Button onclick={openInBrowser} variant="link" class="text-sm">
							{m.continue_in_browser()}
						</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header class="text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<Lock class="h-8 w-8" />
				</div>
				<Card.Title>{m.protected_link()}</Card.Title>
				<p class="text-sm text-muted-foreground">{m.protected_link_desc()}</p>
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
								class="mt-1"
								placeholder={m.password_placeholder()}
								bind:value={password}
								required
								autofocus
							/>
						</div>

						<Button type="submit" disabled={isLoading || !password} class="w-full">
							{#if isLoading}
								{m.verification_progress()}
							{:else}
								{m.access_link()}
							{/if}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<style>
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
