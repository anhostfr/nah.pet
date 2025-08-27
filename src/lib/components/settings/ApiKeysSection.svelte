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
	import * as m from '$lib/paraglide/messages'
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
						<span>{m.api_keys()}</span>
					</Card.Title>
					<Card.Description>{m.api_keys_desc()}</Card.Description>
				</div>
				<div class="space-x-0.5">
					<Button href="/doc" variant="outline">
						<Shield class="w-4 h-4 mr-2" />
						{m.api_documentation()}
					</Button>
					<Button onclick={() => (showCreateApiKey = true)}>
						<Plus class="w-4 h-4 mr-2" />
						{m.create_new_api_key()}
					</Button>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if showNewApiKey && newApiKeyValue}
				<div
					class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
				>
					<div class="flex items-center space-x-2 mb-2">
						<Shield class="w-5 h-5 text-green-600 dark:text-green-400" />
						<h3 class="font-semibold text-green-800 dark:text-green-200">{m.new_api_key_created()}</h3>
					</div>
					<p class="text-sm text-green-700 dark:text-green-300 mb-3">
						{m.copy_key_warning()}
					</p>
					<div class="flex items-center space-x-2">
						<Input value={newApiKeyValue} readonly class="font-mono text-sm" />
						<Button variant="outline" size="sm" onclick={() => copyToClipboard(newApiKeyValue)}>
							<Copy class="w-4 h-4" />
						</Button>
					</div>
				</div>
			{/if}

			{#if showCreateApiKey}
				<Card.Root class="border-dashed">
					<Card.Content>
						<form method="POST" action="?/createApiKey" use:enhance class="space-y-4">
							<h3 class="font-semibold flex items-center space-x-2 mb-4">
								<Plus class="w-4 h-4" />
								<span>{m.create_new_api_key()}</span>
							</h3>

							<div class="space-y-2">
								<Label for="name">{m.key_name()}</Label>
								<Input
									id="name"
									name="name"
									placeholder={m.key_name_placeholder()}
									required
									minlength={3}
								/>
							</div>

							<div class="space-y-2">
								<Label>{m.permissions()}</Label>
								<div class="grid grid-cols-1 md:grid-cols-3 gap-2">
									<div class="flex items-center space-x-2">
										<Checkbox id="links-read" name="permissions" value="links:read" />
										<Label for="links-read" class="text-sm">{m.read_links()}</Label>
									</div>
									<div class="flex items-center space-x-2">
										<Checkbox id="links-write" name="permissions" value="links:write" />
										<Label for="links-write" class="text-sm">{m.write_links()}</Label>
									</div>
									<div class="flex items-center space-x-2">
										<Checkbox id="stats-read" name="permissions" value="stats:read" />
										<Label for="stats-read" class="text-sm">{m.read_stats()}</Label>
									</div>
								</div>
							</div>

							<div class="flex gap-2">
								<Button type="submit">
									<Plus class="w-4 h-4 mr-2" />
									{m.create_key()}
								</Button>
								<Button type="button" variant="outline" onclick={() => (showCreateApiKey = false)}>
									{m.cancel()}
								</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			{/if}

			<div class="space-y-3">
				<h3 class="font-semibold">{m.existing_keys()}</h3>

				{#if data.apiKeys.length === 0}
					<p class="text-sm text-muted-foreground">{m.no_api_keys()}</p>
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
										<span>{m.created_on()} {formatDate(apiKey.createdAt)}</span>
									</div>
									{#if apiKey.lastUsedAt}
										<span>{m.last_used({ date: formatDate(apiKey.lastUsedAt) })}</span>
									{:else}
										<span>{m.never_used()}</span>
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
											if (!confirm(m.delete_api_key_confirm())) {
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
