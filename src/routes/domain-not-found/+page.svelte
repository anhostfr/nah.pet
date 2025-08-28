<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AlertTriangle, Home, ExternalLink } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { PUBLIC_MAIN_DOMAIN } from '$env/static/public';
	const domain = page.url.searchParams.get('domain') || 'domaine inconnu';
	let { data } = $props();
</script>

<svelte:head>
	<title>Domaine non trouvé - Nah.pet</title>
</svelte:head>

<div class="min-h-full flex items-center justify-center p-4">
	<div class="flex flex-col items-center justify-center max-w-md w-full rounded-lg shadow-lg p-6">
		<div class="mb-6">
			<div
				class="w-16 h-16 bg-rose-400/30 rounded-full flex items-center justify-center mx-auto mb-4"
			>
				<AlertTriangle class="w-8 h-8 text-destructive" />
			</div>
			<h1 class="text-2xl font-bold text-white mb-2 text-center">{m.domain_not_found_title()}</h1>
			<p class="text-gray-400 text-center">
				{m.domain_not_configured({ domain })}
			</p>
		</div>

		<div class="bg-gray-800 rounded-lg p-4 mb-6">
			<h3 class="font-semibold text-white mb-2">{m.what_to_do()}</h3>
			<ul class="text-sm text-gray-400 space-y-1 text-left">
				<li>{m.check_domain_config()}</li>
				<li>{m.contact_domain_admin()}</li>
				<li>{m.use_nahpet_directly({ domain: PUBLIC_MAIN_DOMAIN })}</li>
			</ul>
		</div>

		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<Button href={'https://' + PUBLIC_MAIN_DOMAIN} class="flex items-center gap-2">
				<Home class="w-4 h-4" />
				{m.go_to_nahpet()}
			</Button>
			{#if data?.user}
				<Button
					variant="outline"
					href={'https://' + PUBLIC_MAIN_DOMAIN + '/domains'}
					class="flex items-center gap-2"
				>
					<ExternalLink class="w-4 h-4" />
					{m.manage_domains()}
				</Button>
			{/if}
		</div>
	</div>
</div>
