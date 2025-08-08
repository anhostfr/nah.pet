<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Globe, Plus, Trash2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	let { data, showAddDomain = $bindable(), formatDate } = $props();
</script>

<div in:slide={{ duration: 200, delay: 400 }} out:slide={{ duration: 400, delay: 0 }}>
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center space-x-2">
						<Globe class="w-5 h-5" />
						<span>Domaines personnalisés</span>
					</Card.Title>
					<Card.Description
						>Configurez vos propres domaines pour créer des liens courts personnalisés</Card.Description
					>
				</div>
				<Button onclick={() => (showAddDomain = true)}>
					<Plus class="w-4 h-4 mr-2" />
					Ajouter un domaine
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
								<span>Ajouter un nouveau domaine</span>
							</h3>

							<div class="space-y-2">
								<Label for="domain">Domaine</Label>
								<Input id="domain" name="domain" type="text" placeholder="exemple.com" required />
								<p class="text-xs text-muted-foreground">
									Format: monsite.com (sans https:// ni www)
								</p>
							</div>

							<div class="space-y-2">
								<Label>Méthode de vérification</Label>
								<div class="flex gap-4">
									<label class="flex items-center space-x-2">
										<input type="radio" name="method" value="dns" checked required />
										<span class="text-sm">DNS (Recommandé)</span>
									</label>
									<label class="flex items-center space-x-2">
										<input type="radio" name="method" value="file" required />
										<span class="text-sm">Fichier</span>
									</label>
								</div>
							</div>

							<div class="flex gap-2">
								<Button type="submit">
									<Plus class="w-4 h-4 mr-2" />
									Ajouter le domaine
								</Button>
								<Button type="button" variant="outline" onclick={() => (showAddDomain = false)}>
									Annuler
								</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			{/if}

			<div class="space-y-3">
				<h3 class="font-semibold">Domaines existants</h3>

				{#if data.customDomains.length === 0}
					<p class="text-sm text-muted-foreground">Aucun domaine personnalisé configuré</p>
				{:else}
					{#each data.customDomains as domain}
						<div class="border rounded-lg p-4 space-y-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<h4 class="font-medium text-lg">{domain.domain}</h4>
									<Badge variant={domain.verified ? 'default' : 'secondary'}>
										{domain.verified ? 'Vérifié' : 'En attente'}
									</Badge>
								</div>
								<form method="POST" action="?/deleteDomain" use:enhance class="inline">
									<input type="hidden" name="domainId" value={domain.id} />
									<Button
										type="submit"
										variant="ghost"
										size="sm"
										onclick={(e) => {
											if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
												e.preventDefault();
											}
										}}
									>
										<Trash2 class="w-4 h-4" />
									</Button>
								</form>
							</div>

							<div class="text-sm text-muted-foreground">
								<p>Créé le {formatDate(domain.createdAt)} • {domain._count.links} lien(s)</p>
							</div>

							{#if !domain.verified}
								<div class="p-3 bg-muted rounded-lg">
									<h5 class="font-medium mb-2">Instructions de vérification</h5>
									{#if domain.verificationMethod === 'dns'}
										<ol class="list-decimal list-inside space-y-1 text-sm">
											<li>Connectez-vous à votre fournisseur DNS</li>
											<li>Ajoutez un enregistrement TXT :</li>
											<li class="ml-4">• Type: TXT</li>
											<li class="ml-4">• Nom: {domain.domain}</li>
											<li class="ml-4">• Valeur: {domain.verificationToken}</li>
											<li>Attendez la propagation DNS puis cliquez sur "Vérifier"</li>
										</ol>
									{:else}
										<ol class="list-decimal list-inside space-y-1 text-sm">
											<li>Créez le fichier /.well-known/nah-pet-verification.txt</li>
											<li>Contenu: {domain.verificationToken}</li>
											<li>
												Rendez-le accessible via https://{domain.domain}/.well-known/nah-pet-verification.txt
											</li>
										</ol>
									{/if}
								</div>

								<form method="POST" action="?/verifyDomain" use:enhance>
									<input type="hidden" name="domainId" value={domain.id} />
									<Button type="submit" size="sm">Vérifier le domaine</Button>
								</form>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
