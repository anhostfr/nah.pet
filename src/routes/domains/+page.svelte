<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Trash2, ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { isMobile } from '$lib/utils';
	
	const SYSTEM_RESERVED_SLUGS = [
		'admin', 'api', 'app', 'auth', 'blog', 'cdn', 'dashboard', 'dev', 'docs', 
		'ftp', 'help', 'login', 'logout', 'mail', 'news', 'register', 'root', 
		'shop', 'ssl', 'staging', 'stats', 'support', 'test', 'www', 'domains', 
		'pending', 'settings', 'profile', 'account'
	];

	export let data: PageData;
	export let form;

	let isAdding = false;
	let isVerifying = false;
	let isDeleting = false;
	let selectedMethod: 'dns' | 'file' = 'dns';

	$: if (form?.success) {
		toast.success(form.message);
		invalidateAll();
	} else if (form?.error) {
		toast.error(form.error);
	}

	function getStatusBadge(verified: boolean) {
		if (verified) {
			return { variant: 'default' as const, icon: CheckCircle, text: 'Vérifié' };
		} else {
			return { variant: 'secondary' as const, icon: Clock, text: 'En attente' };
		}
	}

	function getVerificationInstructions(domain: string, token: string, method: 'dns' | 'file') {
		if (method === 'dns') {
			return {
				title: 'Vérification DNS (Recommandé)',
				steps: [
					'Connectez-vous à votre fournisseur DNS (Cloudflare, Namecheap, OVH, etc.)',
					'Ajoutez un nouvel enregistrement TXT :',
					`• Type: TXT`,
					`• Nom/Host: ${domain} (ou @ si c'est le domaine racine)`,
					`• Valeur: ${token}`,
					'Attendez la propagation DNS (5 minutes à 24h selon le fournisseur)',
					'Revenez ici et cliquez sur "Vérifier le domaine"'
				]
			};
		} else {
			return {
				title: 'Vérification par fichier',
				steps: [
					'Créez le répertoire /.well-known/ à la racine de votre site web',
					'Créez le fichier : /.well-known/nah-pet-verification.txt',
					`Contenu exact du fichier : ${token}`,
					`Vérifiez que le fichier est accessible via :`,
					`https://${domain}/.well-known/nah-pet-verification.txt`,
					'Revenez ici et cliquez sur "Vérifier le domaine"'
				]
			};
		}
	}
</script>

<svelte:head>
	<title>Domaines personnalisés - Nah Pet</title>
</svelte:head>

<div class="container mx-auto py-8 px-4">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Domaines personnalisés</h1>
		<p class="text-muted-foreground">
			Configurez vos propres domaines pour créer des liens courts personnalisés.
		</p>
	</div>

	<Card.Root class="mb-8 bg-gradient-to-br from-red-900/20 to-red-800/20 dark:border-red-800">
		<Card.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-red-600" />
				<Card.Title class="text-red-600">Important - Isolation des domaines</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-red-600">
			<p class="mb-2">
				<strong>Isolation totale :</strong> Chaque domaine personnalisé fonctionne comme un espace complètement séparé.
			</p>
			<ul class="list-disc list-inside space-y-1 text-sm">
				<li>Un domaine custom ne peut accéder qu'à ses propres liens</li>
				<li>Aucun accès aux liens du domaine principal (nah.pet)</li>
				<li>Aucun accès aux pages système (login, register, admin, etc.)</li>
				<li>Slugs interdits sur domaines custom: {SYSTEM_RESERVED_SLUGS.slice(0, 8).join(', ')}, ...</li>
			</ul>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-8 bg-gradient-to-br from-blue-900/20 to-blue-800/20 dark:border-blue-800">
		<Card.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-blue-600" />
				<Card.Title class="text-blue-600">Configuration DNS requise</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-blue-600">
			<p class="mb-3">
				<strong>Après vérification, configurez votre domaine pour rediriger vers nah.pet :</strong>
			</p>
			<div class="bg-blue-900/20 p-3 rounded-lg mb-3">
				<p class="font-mono text-sm">
					• Créez un enregistrement CNAME : votre-domaine.com → nah.pet<br/>
				</p>
			</div>
			<p class="text-sm">
				Une fois configuré, votre-domaine.com/abc123 redirigera automatiquement vers vos liens raccourcis.
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Ajouter un nouveau domaine</Card.Title>
			<Card.Description>
				Ajoutez votre domaine (ex: monsite.com) pour créer des liens courts comme monsite.com/abc123.
				Une fois vérifié, votre domaine fonctionnera comme un raccourcisseur indépendant.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form 
				method="POST" 
				action="?/addDomain"
				use:enhance={() => {
					isAdding = true;
					return async ({ update }) => {
						await update();
						isAdding = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<Label for="domain">Domaine</Label>
					<Input
						id="domain"
						name="domain"
						type="text"
						placeholder="exemple.com"
						required
						class="mt-1"
					/>
					<p class="text-sm text-muted-foreground mt-1">
						Format: monsite.com (sans https:// ni www)
					</p>
				</div>

				<div>
					<Label>Méthode de vérification</Label>
					<div class="flex gap-4 mt-2">
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="method"
								value="dns"
								bind:group={selectedMethod}
								required
							/>
							DNS (Recommandé)
						</label>
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="method"
								value="file"
								bind:group={selectedMethod}
								required
							/>
							Fichier
						</label>
					</div>
				</div>

				<Button type="submit" disabled={isAdding}>
					{isAdding ? 'Ajout en cours...' : 'Ajouter le domaine'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<div class="space-y-4">
		{#each data.customDomains as domain}
			{@const status = getStatusBadge(domain.verified)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Card.Title class="text-xl">{domain.domain}</Card.Title>
							<Badge variant={status.variant} class="flex items-center gap-1">
								<svelte:component this={status.icon} class="h-3 w-3" />
								{status.text}
							</Badge>
						</div>
						<div class="flex items-center gap-2">
							{#if domain.verified}
								<Button 
									variant="outline" 
									size="sm"
									onclick={() => window.open(`https://${domain.domain}`, '_blank')}
								>
									<ExternalLink class="h-4 w-4 md:mr-1" />{isMobile() ? '' : 'Visiter'}
								</Button>
							{/if}
							<form 
								method="POST" 
								action="?/deleteDomain"
								use:enhance={() => {
									isDeleting = true;
									return async ({ update }) => {
										await update();
										isDeleting = false;
									};
								}}
							>
								<input type="hidden" name="domainId" value={domain.id} />
								<Button 
									type="submit" 
									variant="destructive" 
									size="sm"
									disabled={isDeleting}
									title={domain._count.links > 0 ? `Supprimer le domaine et ses ${domain._count.links} lien(s)` : 'Supprimer le domaine'}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>
					<Card.Description>
						Créé le {new Date(domain.createdAt).toLocaleDateString('fr-FR')} • 
						{domain._count.links} lien{domain._count.links !== 1 ? 's' : ''}
					</Card.Description>
				</Card.Header>

				{#if !domain.verified}
					<Card.Content>
						{@const instructions = getVerificationInstructions(domain.domain, domain.verificationToken, domain.verificationMethod as 'dns' | 'file')}
						
						<div class="mb-4 p-4 bg-muted rounded-lg">
							<h4 class="font-semibold mb-2">{instructions.title}</h4>
							<ol class="list-decimal list-inside space-y-1 text-sm">
								{#each instructions.steps as step}
									<li>{step}</li>
								{/each}
							</ol>
						</div>

						<form 
							method="POST" 
							action="?/verifyDomain"
							use:enhance={() => {
								isVerifying = true;
								return async ({ update }) => {
									await update();
									isVerifying = false;
								};
							}}
						>
							<input type="hidden" name="domainId" value={domain.id} />
							<Button type="submit" disabled={isVerifying}>
								{isVerifying ? 'Vérification...' : 'Vérifier le domaine'}
							</Button>
						</form>
					</Card.Content>
				{/if}
			</Card.Root>
		{/each}

		{#if data.customDomains.length === 0}
			<Card.Root>
				<Card.Content class="text-center py-8">
					<p class="text-muted-foreground">
						Aucun domaine personnalisé configuré.
					</p>
					<p class="text-sm text-muted-foreground mt-1">
						Ajoutez votre premier domaine pour commencer à créer des liens personnalisés.
					</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>