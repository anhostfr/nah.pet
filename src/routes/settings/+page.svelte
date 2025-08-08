<script lang="ts">
	import { Settings, User, Key, Globe } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AccountSection from '$lib/components/settings/AccountSection.svelte';
	import ApiKeysSection from '$lib/components/settings/ApiKeysSection.svelte';
	import DomainsSection from '$lib/components/settings/DomainsSection.svelte';

	let { data, form } = $props();

	let activeTab = $state('account');
	let showNewApiKey = $state(false);
	let newApiKeyValue = $state('');
	let showCreateApiKey = $state(false);
	let showAddDomain = $state(false);

	const tabs = [
		{ id: 'account', label: 'Compte', icon: User },
		{ id: 'api-keys', label: 'Clés API', icon: Key },
		{ id: 'domains', label: 'Domaines', icon: Globe }
	];

	async function copyToClipboard(text: string) {
		await navigator.clipboard.writeText(text);
		toast.success('Copié dans le presse-papier');
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getPermissionLabel(permission: string) {
		switch (permission) {
			case 'links:read':
				return 'Lecture liens';
			case 'links:write':
				return 'Écriture liens';
			case 'stats:read':
				return 'Lecture stats';
			default:
				return permission;
		}
	}

	$effect(() => {
		if (form?.key) {
			newApiKeyValue = form.key;
			showNewApiKey = true;
			showCreateApiKey = false;
		}
		if (form?.success) {
			showCreateApiKey = false;
			showAddDomain = false;
		}
	});
</script>

<div class="flex gap-6">
	<div class="w-64 space-y-2">
		<div class="flex items-center space-x-2 mb-6">
			<Settings class="w-6 h-6" />
			<h1 class="text-2xl font-bold">Paramètres</h1>
		</div>

		<nav class="space-y-1">
			{#each tabs as tab}
				<button
					class="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors"
					class:bg-muted={activeTab === tab.id}
					class:text-primary={activeTab === tab.id}
					class:hover:bg-muted={activeTab !== tab.id}
					onclick={() => (activeTab = tab.id)}
				>
					<tab.icon class="w-5 h-5" />
					<span class="font-medium">{tab.label}</span>
				</button>
			{/each}
		</nav>
	</div>

	<div class="flex-1 space-y-6">
		{#if activeTab === 'account'}
			<AccountSection {data} {formatDate} />
		{:else if activeTab === 'api-keys'}
			<ApiKeysSection
				{data}
				bind:showCreateApiKey
				bind:showNewApiKey
				bind:newApiKeyValue
				{formatDate}
				{getPermissionLabel}
				{copyToClipboard}
			/>
		{:else if activeTab === 'domains'}
			<DomainsSection {data} bind:showAddDomain {formatDate} />
		{/if}
	</div>
</div>

{#if form?.error}
	<script>
		toast.error(form.error);
	</script>
{/if}

{#if form?.success}
	<script>
		toast.success('Opération réussie');
	</script>
{/if}
