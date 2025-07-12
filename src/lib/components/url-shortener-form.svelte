<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { enhance } from '$app/forms';
	import {
		Link,
		Copy,
		Check,
		Settings,
		Lock,
		Calendar,
		Sparkles,
		ExternalLink,
		Globe
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';

	let { form, customDomains } = $props();

	let originalUrl = $state('');
	let customSlug = $state('');
	let title = $state('');
	let password = $state('');
	let expiresAt = $state('');
	let selectedDomainValue = $state('');
	let showAdvanced = $state(false);
	let isLoading = $state(false);
	let copied = $state(false);

	
	const domainOptions = $derived([
		{ value: '', label: 'nah.pet (domaine principal)' },
		...customDomains.map((domain: any) => ({
			value: domain.id,
			label: domain.domain
		}))
	]);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			toast.success('Lien copié dans le presse-papier !');
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			toast.error('Impossible de copier le lien');
		}
	};

	const generateSlug = () => {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		customSlug = result;
	};
</script>

<div class="space-y-6">
	{#if form?.success && form?.link}
		<Card.Root
			class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
		>
			<Card.Content class="p-6">
				<div class="flex items-start space-x-4">
					<div
						class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0"
					>
						<Check class="w-6 h-6 text-white" />
					</div>
					<div class="flex-1 space-y-4">
						<div>
							<h3 class="font-semibold text-green-900 dark:text-green-100 mb-2">
								✨ Lien créé avec succès !
							</h3>
							{#if form.link.title}
								<p class="text-sm text-green-800 dark:text-green-200 mb-2">
									{form.link.title}
								</p>
							{/if}
						</div>

						<div
							class="flex items-center space-x-2 p-3 rounded-lg border border-green-200 dark:border-green-700"
						>
							<Link class="w-4 h-4 text-green-600" />
							<code class="flex-1 text-sm font-mono text-gray-900 dark:text-white">
								{form.shortUrl || `${window.location.origin}/${form.link.slug}`}
							</code>
							<Button
								size="sm"
								variant="ghost"
								onclick={() => copyToClipboard(form.shortUrl || `${window.location.origin}/${form.link.slug}`)}
								class="h-8 w-8 p-0"
							>
								{#if copied}
									<Check class="w-4 h-4 text-green-600" />
								{:else}
									<Copy class="w-4 h-4" />
								{/if}
							</Button>
							<Button
								href={form.shortUrl || `/${form.link.slug}`}
								target="_blank"
								size="sm"
								variant="ghost"
								class="h-8 w-8 p-0"
							>
								<ExternalLink class="w-4 h-4" />
							</Button>
						</div>

						{#if form?.qrCode}
							<div
								class="flex items-center justify-center p-4 rounded-lg border border-green-200 dark:border-green-700"
							>
								<img src={form.qrCode} alt="QR Code" class="w-32 h-32" />
							</div>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				await update();
				isLoading = false;

				if (form?.success) {
					originalUrl = '';
					customSlug = '';
					title = '';
					password = '';
					expiresAt = '';
					selectedDomainValue = '';
					showAdvanced = false;
				}
			};
		}}
		class="space-y-6"
	>

		<input type="hidden" name="customDomainId" value={selectedDomainValue} />

		<div class="space-y-2">
			<Label for="originalUrl" class="text-base font-medium">URL à raccourcir</Label>
			<div class="relative">
				<Input
					id="originalUrl"
					name="originalUrl"
					type="url"
					placeholder="https://example.com/ma-super-url-tres-longue"
					bind:value={originalUrl}
					required
					class="pl-10 text-base h-12"
					autofocus
				/>
				<Link class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
			</div>
		</div>

		{#if customDomains.length > 0}
			<div class="space-y-2">
				<Label class="text-base font-medium flex items-center gap-2">
					<Globe class="w-4 h-4" />
					Domaine pour le lien court
				</Label>
				<Select.Root type="single" bind:value={selectedDomainValue}>
					<Select.Trigger class="h-12">
						<span>
							{selectedDomainValue === '' 
								? 'nah.pet (domaine principal)' 
								: customDomains.find((d: any) => d.id === selectedDomainValue)?.domain}
						</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="nah.pet (domaine principal)">
							nah.pet (domaine principal)
							<Badge variant="outline" class="ml-2 text-xs">Par défaut</Badge>
						</Select.Item>
						{#each customDomains as domain}
							<Select.Item value={domain.id} label={domain.domain}>
								{domain.domain}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{/if}

		<div class="flex items-center justify-between">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => (showAdvanced = !showAdvanced)}
				class="flex items-center space-x-2"
			>
				<Settings class="w-4 h-4" />
				<span>Options avancées</span>
				<div
					class="w-2 h-2 rounded-full bg-blue-500 {showAdvanced
						? 'opacity-100'
						: 'opacity-0'} transition-opacity"
				></div>
			</Button>
		</div>

		{#if showAdvanced}
			<div class="grid gap-4 p-4 border-border border-[1px] rounded-lg" transition:slide>
				<div class="grid md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="customSlug" class="flex items-center space-x-2">
							<span>Slug personnalisé</span>
							<Badge variant="secondary" class="text-xs">Optionnel</Badge>
						</Label>
						<div class="flex space-x-2">
							<Input
								id="customSlug"
								name="customSlug"
								placeholder="mon-lien"
								bind:value={customSlug}
								class="font-mono"
							/>
							<Button type="button" variant="outline" size="sm" onclick={generateSlug}>
								<Sparkles class="w-4 h-4" />
							</Button>
						</div>
						<p class="text-xs text-gray-500">
							URL finale : {selectedDomainValue ? 
								`https://${customDomains.find((d: any) => d.id === selectedDomainValue)?.domain || 'domaine.com'}/${customSlug || 'votre-slug'}` :
								`${window.location.origin}/${customSlug || 'votre-slug'}`
							}
						</p>
					</div>

					<div class="space-y-2">
						<Label for="title" class="flex items-center space-x-2">
							<span>Titre du lien</span>
							<Badge variant="secondary" class="text-xs">Optionnel</Badge>
						</Label>
						<Input id="title" name="title" placeholder="Mon lien important" bind:value={title} />
						<p class="text-xs text-gray-500">Pour vous aider à identifier ce lien</p>
					</div>
				</div>

				<div class="grid md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="password" class="flex items-center space-x-2">
							<Lock class="w-4 h-4" />
							<span>Mot de passe</span>
							<Badge variant="secondary" class="text-xs">Optionnel</Badge>
						</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Protéger par mot de passe"
							bind:value={password}
						/>
						<p class="text-xs text-gray-500">Le lien nécessitera ce mot de passe</p>
					</div>

					<div class="space-y-2">
						<Label for="expiresAt" class="flex items-center space-x-2">
							<Calendar class="w-4 h-4" />
							<span>Expiration</span>
							<Badge variant="secondary" class="text-xs">Optionnel</Badge>
						</Label>
						<Input id="expiresAt" name="expiresAt" type="datetime-local" bind:value={expiresAt} />
						<p class="text-xs text-gray-500">Le lien expirera automatiquement</p>
					</div>
				</div>
			</div>
		{/if}

		{#if form?.error}
			<div
				class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
			>
				<p class="text-sm text-red-800 dark:text-red-200 flex items-center space-x-2">
					<span class="w-2 h-2 bg-red-500 rounded-full"></span>
					<span>{form.error}</span>
				</p>
			</div>
		{/if}

		<Button
			type="submit"
			disabled={isLoading || !originalUrl}
			class="w-full h-12 text-base font-medium"
		>
			{#if isLoading}
				<div
					class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
				></div>
				Création en cours...
			{:else}
				<Link class="w-5 h-5 mr-2" />
				Raccourcir le lien
			{/if}
		</Button>
	</form>
</div>
