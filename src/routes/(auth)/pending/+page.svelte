<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Clock,
		Mail,
		RefreshCw,
		CheckCircle,
		AlertCircle,
		Users,
		Shield,
		Home,
		LogOut
	} from 'lucide-svelte';
	import { formatDate } from '$lib/utils.js';
	import { page } from '$app/stores';

	let { data } = $props();

	let isRefreshing = $state(false);

	const refreshPage = async () => {
		isRefreshing = true;
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	};

	const getWaitingMessage = (days: number) => {
		if (days === 0) return "Demande envoyée aujourd'hui";
		if (days === 1) return 'En attente depuis 1 jour';
		return `En attente depuis ${days} jours`;
	};
</script>

<svelte:head>
	<title>Compte en attente - Nah.pet</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="max-w-2xl w-full space-y-8">
		<Card.Root class="shadow-2xl border-0 backdrop-blur-xl">
			<Card.Header class="text-center border-b border-gray-100 dark:border-gray-700 pb-6">
				<div
					class="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<Clock class="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
				</div>
				<Card.Title class="text-xl text-gray-900 dark:text-white">
					Votre compte n'est pas encore activé
				</Card.Title>
			</Card.Header>

			<Card.Content class="p-8 space-y-6">
				<div class="space-y-4 border-border border-[1px] rounded-lg">
					<div class="flex items-center justify-between p-4 rounded-lg">
						<div class="flex items-center space-x-3">
							<Mail class="w-5 h-5 text-accent" />
							<span class="text-sm text-secondary-foreground">Email :</span>
						</div>
						<span class="font-medium text-gray-900 dark:text-white">
							{data.user?.email}
						</span>
					</div>

					<div class="flex items-center justify-between p-4 rounded-lg">
						<div class="flex items-center space-x-3">
							<Clock class="w-5 h-5 text-accent" />
							<span class="text-sm text-secondary-foreground">Statut :</span>
						</div>
						<Badge
							variant="outline"
							class="bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
						>
							{getWaitingMessage(data.waitingDays)}
						</Badge>
					</div>

					<div class="flex items-center justify-between p-4 rounded-lg">
						<div class="flex items-center space-x-3">
							<Users class="w-5 h-5 text-accent" />
							<span class="text-sm text-secondary-foreground">Inscrit le :</span>
						</div>
						<span class="font-medium text-gray-900 dark:text-white">
							{formatDate(data.user?.createdAt || new Date())}
						</span>
					</div>
				</div>

				<div
					class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
				>
					<div class="flex items-start space-x-3">
						<AlertCircle class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
						<div>
							<h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
								Qu'est-ce que cela signifie ?
							</h3>
							<div class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
								<p>• Votre compte a été créé avec succès</p>
								<p>• Un administrateur doit approuver votre demande d'accès</p>
								<p>• Vous recevrez une notification dès l'activation</p>
								<p>• En attendant, vous ne pouvez pas créer de liens</p>
							</div>
						</div>
					</div>
				</div>

				<div class="border-border border-[1px] rounded-lg p-6">
					<h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
						<CheckCircle class="w-5 h-5 mr-2 text-green-500" />
						Processus d'approbation
					</h3>
					<div class="space-y-3">
						<div class="flex items-center space-x-3">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								✅ Compte créé et email vérifié
							</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								⏳ En attente de validation administrateur
							</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-2 h-2 bg-gray-300 rounded-full"></div>
							<span class="text-sm text-gray-400"> 🎯 Accès complet au service </span>
						</div>
					</div>
				</div>

				<div class="flex flex-col sm:flex-row gap-3 pt-4">
					<Button onclick={refreshPage} disabled={isRefreshing} variant="default" class="flex-1">
						{#if isRefreshing}
							<RefreshCw class="w-4 h-4 mr-2 animate-spin" />
							Actualisation...
						{:else}
							<RefreshCw class="w-4 h-4 mr-2" />
							Actualiser le statut
						{/if}
					</Button>

					<Button href="/" variant="outline" class="flex-1">
						<Home class="w-4 h-4 mr-2" />
						Retour à l'accueil
					</Button>

					<form method="POST" action="/logout" class="flex-1">
						<Button type="submit" variant="ghost" class="w-full">
							<LogOut class="w-4 h-4 mr-2" />
							Se déconnecter
						</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="text-center text-sm text-gray-500 dark:text-gray-400">
			<p>© {new Date().getFullYear()} Nah.pet — Pet-redirect-as-a-Service since forever.</p>
		</div>
	</div>
</div>
