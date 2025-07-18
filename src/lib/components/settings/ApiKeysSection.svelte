<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Key, Shield, Plus, Trash2, Copy, Clock } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	let { 
		data, 
		showCreateApiKey = $bindable(), 
		showNewApiKey = $bindable(), 
		newApiKeyValue = $bindable(), 
		formatDate, 
		getPermissionLabel, 
		copyToClipboard 
	} = $props();
</script>

<div in:slide={{ duration: 200, delay: 400 }} out:slide={{ duration: 400, delay: 0 }}>
<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="flex items-center space-x-2">
					<Key class="w-5 h-5" />
					<span>Clés API</span>
				</Card.Title>
				<Card.Description>Gérez vos clés API pour accéder à l'API Nah.pet</Card.Description>
			</div>
			<Button onclick={() => showCreateApiKey = true}>
				<Plus class="w-4 h-4 mr-2" />
				Créer une clé
			</Button>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if showNewApiKey && newApiKeyValue}
			<div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
				<div class="flex items-center space-x-2 mb-2">
					<Shield class="w-5 h-5 text-green-600 dark:text-green-400" />
					<h3 class="font-semibold text-green-800 dark:text-green-200">Nouvelle clé API créée</h3>
				</div>
				<p class="text-sm text-green-700 dark:text-green-300 mb-3">
					Copiez cette clé maintenant, elle ne sera plus affichée.
				</p>
				<div class="flex items-center space-x-2">
					<Input
						value={newApiKeyValue}
						readonly
						class="font-mono text-sm"
					/>
					<Button
						variant="outline"
						size="sm"
						onclick={() => copyToClipboard(newApiKeyValue)}
					>
						<Copy class="w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}

		<!-- Formulaire nouvelle clé -->
		{#if showCreateApiKey}
			<Card.Root class="border-dashed">
				<Card.Content>
					<form method="POST" action="?/createApiKey" use:enhance class="space-y-4">
						<h3 class="font-semibold flex items-center space-x-2 mb-4">
							<Plus class="w-4 h-4" />
							<span>Créer une nouvelle clé API</span>
						</h3>
						
						<div class="space-y-2">
							<Label for="name">Nom de la clé</Label>
							<Input
								id="name"
								name="name"
								placeholder="ex: Mon application"
								required
								minlength={3}
							/>
						</div>

						<div class="space-y-2">
							<Label>Permissions</Label>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-2">
								<div class="flex items-center space-x-2">
									<Checkbox id="links-read" name="permissions" value="links:read" />
									<Label for="links-read" class="text-sm">Lecture liens</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox id="links-write" name="permissions" value="links:write" />
									<Label for="links-write" class="text-sm">Écriture liens</Label>
								</div>
								<div class="flex items-center space-x-2">
									<Checkbox id="stats-read" name="permissions" value="stats:read" />
									<Label for="stats-read" class="text-sm">Lecture stats</Label>
								</div>
							</div>
						</div>

						<div class="flex gap-2">
							<Button type="submit">
								<Plus class="w-4 h-4 mr-2" />
								Créer la clé
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={() => showCreateApiKey = false}
							>
								Annuler
							</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}

		<div class="space-y-3">
			<h3 class="font-semibold">Clés existantes</h3>
			
			{#if data.apiKeys.length === 0}
				<p class="text-sm text-muted-foreground">Aucune clé API créée</p>
			{:else}
				{#each data.apiKeys as apiKey}
					<div class="flex items-center justify-between p-4 border rounded-lg">
						<div class="flex-1">
							<div class="flex items-center space-x-2 mb-2">
								<h4 class="font-medium">{apiKey.name}</h4>
								<div class="flex flex-wrap gap-1">
									{#each apiKey.permissions as permission}
										<Badge variant="secondary" class="text-xs">
											{getPermissionLabel(permission)}
										</Badge>
									{/each}
								</div>
							</div>
							
							<div class="flex items-center space-x-4 text-sm text-muted-foreground">
								<div class="flex items-center space-x-1">
									<Clock class="w-3 h-3" />
									<span>Créée le {formatDate(apiKey.createdAt)}</span>
								</div>
								{#if apiKey.lastUsedAt}
									<span>Dernière utilisation: {formatDate(apiKey.lastUsedAt)}</span>
								{:else}
									<span>Jamais utilisée</span>
								{/if}
							</div>
						</div>
						
						<div class="flex items-center space-x-2">
							<form method="POST" action="?/deleteApiKey" use:enhance class="inline">
								<input type="hidden" name="keyId" value={apiKey.id} />
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									onclick={(e) => {
										if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) {
											e.preventDefault();
										}
									}}
								>
									<Trash2 class="w-4 h-4" />
								</Button>
							</form>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</Card.Content>
</Card.Root>
</div>