<script lang="ts">
	import { Settings, User, Key, Globe } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import AccountSection from '$lib/components/settings/account-section.svelte';
	import ApiKeysSection from '$lib/components/settings/api-keys-section.svelte';
	import DomainsSection from '$lib/components/settings/domains-section.svelte';
	import type { NormalizedActionData } from '$lib/types';

	let { data, form }: { data: any; form: NormalizedActionData } = $props();

	let activeTab = $state('account');
	let showNewApiKey = $state(false);
	let newApiKeyValue = $state('');
	let showCreateApiKey = $state(false);
	let showAddDomain = $state(false);

	const tabs = [
		{ id: 'account', label: m.account_settings(), icon: User },
		{ id: 'api-keys', label: m.api_keys(), icon: Key },
		{ id: 'domains', label: m.domains(), icon: Globe }
	];

	async function copyToClipboard(text: string) {
		await navigator.clipboard.writeText(text);
		toast.success(m.copied_clipboard());
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
				return m.read_links_permission();
			case 'links:write':
				return m.write_links_permission();
			case 'stats:read':
				return m.read_stats_permission();
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

<svelte:head>
	<title>{m.settings_title()} - Nah.pet</title>
</svelte:head>

<div class="flex gap-6 flex-wrap">
	<div class="w-full md:w-64 space-y-2">
		<div class="flex items-center space-x-2 mb-6">
			<Settings class="w-6 h-6" />
			<h1 class="text-2xl font-bold">{m.settings_title()}</h1>
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

{#if form && form.success === false}
	<script>
		toast.error(tKey(form.messageKey, form));
	</script>
{/if}

{#if form?.success}
	<script>
		toast.success(tKey(form.messageKey, form));
	</script>
{/if}
