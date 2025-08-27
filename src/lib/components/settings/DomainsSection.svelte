<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Globe, Plus, Trash2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	let { data, showAddDomain = $bindable(), formatDate } = $props();
</script>

<div in:slide={{ duration: 200, delay: 400 }} out:slide={{ duration: 400, delay: 0 }}>
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center space-x-2">
						<Globe class="w-5 h-5" />
						<span>{m.custom_domains()}</span>
					</Card.Title>
					<Card.Description
						>{m.custom_domains_desc()}</Card.Description
					>
				</div>
				<Button onclick={() => (showAddDomain = true)}>
					<Plus class="w-4 h-4 mr-2" />
					{m.add_domain()}
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if showAddDomain}
				<Card.Root class="border-dashed">
					<Card.Content>
						<form method="POST" action="?/addDomain" use:enhance class="space-y-4">
							<h3 class="font-semibold flex items-center space-x-2 mb-4">
								<Plus class="w-4 h-4" />
								<span>{m.add_new_domain()}</span>
							</h3>

							<div class="space-y-2">
								<Label for="domain">Domaine</Label>
								<Input id="domain" name="domain" type="text" placeholder="exemple.com" required />
								<p class="text-xs text-muted-foreground">
									{m.domain_format()}
								</p>
							</div>

							<div class="space-y-2">
								<Label>{m.verification_method()}</Label>
								<div class="flex gap-4">
									<label class="flex items-center space-x-2">
										<input type="radio" name="method" value="dns" checked required />
										<span class="text-sm">{m.dns_recommended()}</span>
									</label>
									<label class="flex items-center space-x-2">
										<input type="radio" name="method" value="file" required />
										<span class="text-sm">{m.file_method()}</span>
									</label>
								</div>
							</div>

							<div class="flex gap-2">
								<Button type="submit">
									<Plus class="w-4 h-4 mr-2" />
									{m.add_domain_button()}
								</Button>
								<Button type="button" variant="outline" onclick={() => (showAddDomain = false)}>
									{m.cancel()}
								</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			{/if}

			<div class="space-y-3">
				<h3 class="font-semibold">{m.existing_domains()}</h3>

				{#if data.customDomains.length === 0}
					<p class="text-sm text-muted-foreground">{m.no_custom_domains()}</p>
				{:else}
					{#each data.customDomains as domain}
						<div class="border rounded-lg p-4 space-y-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<h4 class="font-medium text-lg">{domain.domain}</h4>
									<Badge variant={domain.verified ? 'default' : 'secondary'}>
										{domain.verified ? m.verified() : m.pending()}
									</Badge>
								</div>
								<form method="POST" action="?/deleteDomain" use:enhance class="inline">
									<input type="hidden" name="domainId" value={domain.id} />
									<Button
										type="submit"
										variant="ghost"
										size="sm"
										onclick={(e) => {
											if (!confirm(m.delete_domain_confirm_request())) {
												e.preventDefault();
											}
										}}
									>
										<Trash2 class="w-4 h-4" />
									</Button>
								</form>
							</div>

							<div class="text-sm text-muted-foreground">
								<p>{m.created_on()} {formatDate(domain.createdAt)} • {domain._count.links} lien(s)</p>
							</div>

							{#if !domain.verified}
								<div class="p-3 bg-muted rounded-lg">
									<h5 class="font-medium mb-2">{m.verification_instructions()}</h5>
									{#if domain.verificationMethod === 'dns'}
										<ol class="list-decimal list-inside space-y-1 text-sm">
											<li>{m.connect_dns_provider()}</li>
											<li>{m.add_txt_record()}</li>
											<li class="ml-4">{m.txt_type()}</li>
											<li class="ml-4">{m.txt_name({ domain: domain.domain })}</li>
											<li class="ml-4">{m.txt_value({ token: domain.verificationToken })}</li>
											<li>{m.wait_dns_propagation()}</li>
										</ol>
									{:else}
										<ol class="list-decimal list-inside space-y-1 text-sm">
											<li>{m.create_wellknown_file()}</li>
											<li>{m.file_content({ token: domain.verificationToken })}</li>
											<li>
												{m.make_accessible({ domain: domain.domain })}
											</li>
										</ol>
									{/if}
								</div>

								<form method="POST" action="?/verifyDomain" use:enhance>
									<input type="hidden" name="domainId" value={domain.id} />
									<Button type="submit" size="sm">{m.verify_domain_button()}</Button>
								</form>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
