<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AlertTriangle, Home, ExternalLink } from 'lucide-svelte';

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
				class="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
			>
				<AlertTriangle class="w-8 h-8 text-red-600 dark:text-red-400" />
			</div>
			<h1 class="text-2xl font-bold dark:text-white mb-2 text-center">Domaine non reconnu</h1>
			<p class="text-gray-400">
				Le domaine <strong class="text-red-600 dark:text-red-400">{domain}</strong> n'est pas configuré
				sur notre service.
			</p>
		</div>

		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-2">Que faire ?</h3>
			<ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
				<li>• Vérifiez que le domaine est correctement configuré</li>
				<li>• Contactez l'administrateur du domaine</li>
				<li>• Utilisez directement nah.pet</li>
			</ul>
		</div>

		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<Button href="https://nah.pet" class="flex items-center gap-2">
				<Home class="w-4 h-4" />
				Aller à Nah.pet
			</Button>
			{#if data?.user}
				<Button variant="outline" href="https://nah.pet/domains" class="flex items-center gap-2">
					<ExternalLink class="w-4 h-4" />
					Gérer les domaines
				</Button>
			{/if}
		</div>
	</div>
</div>
