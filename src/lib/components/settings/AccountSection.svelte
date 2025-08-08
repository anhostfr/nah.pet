<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { User, Shield } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	let { data, formatDate } = $props();
</script>

<div in:slide={{ duration: 200, delay: 400 }} out:slide={{ duration: 400, delay: 0 }}>
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center space-x-2">
				<User class="w-5 h-5" />
				<span>Informations du compte</span>
			</Card.Title>
			<Card.Description>Informations de votre compte</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Email</Label>
					<Input value={data.user.email} readonly class="bg-muted" disabled />
					<p class="text-xs text-muted-foreground">L'email ne peut pas être modifié via OAuth</p>
				</div>
				<div class="space-y-2">
					<Label>Statut</Label>
					<div class="flex items-center space-x-2">
						<Badge variant={data.user.isActive ? 'default' : 'secondary'}>
							{data.user.isActive ? 'Actif' : 'Inactif'}
						</Badge>
						{#if data.user.isAdmin}
							<Badge variant="destructive">Administrateur</Badge>
						{/if}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center space-x-2">
				<Shield class="w-5 h-5" />
				<span>Sécurité</span>
			</Card.Title>
			<Card.Description>Paramètres de sécurité de votre compte</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label>Authentification</Label>
				<p class="text-sm text-muted-foreground">
					Votre compte utilise l'authentification OAuth. Pour modifier votre mot de passe,
					rendez-vous sur votre fournisseur d'authentification.
				</p>
			</div>

			<div class="space-y-2">
				<Label>Sessions actives</Label>
				<p class="text-sm text-muted-foreground">
					Session actuelle: {formatDate(new Date().toISOString())}
				</p>
				<Button variant="outline" size="sm" disabled>
					Gérer les sessions (bientôt disponible)
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
