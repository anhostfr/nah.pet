<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { BarChart3, Eye, Calendar, ExternalLink, ArrowLeft } from 'lucide-svelte';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import { page } from '$app/stores';

	let { data } = $props();
</script>

<svelte:head>
	<title>Statistiques - /{data.link.slug} - ShortURL</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<Button href="/" variant="ghost" size="sm">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Retour
		</Button>
		<div>
			<h1 class="text-3xl font-bold">Statistiques détaillées</h1>
			<p class="text-muted-foreground">
				Analyse des performances pour /{data.link.slug}
			</p>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<BarChart3 class="h-5 w-5" />
				Informations du lien
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Lien raccourci</p>
					<div class="flex items-center gap-2">
						<code class="text-sm bg-muted px-2 py-1 rounded">
							{$page.url.origin}/{data.link.slug}
						</code>
						<Button variant="ghost" size="sm" href="/{data.link.slug}" target="_blank">
							<ExternalLink class="h-3 w-3" />
						</Button>
					</div>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">URL originale</p>
					<a
						href={data.link.originalUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:underline text-sm break-all"
					>
						{data.link.originalUrl}
					</a>
				</div>
			</div>

			{#if data.link.title}
				<div>
					<p class="text-sm font-medium text-muted-foreground">Titre</p>
					<p class="text-sm">{data.link.title}</p>
				</div>
			{/if}

			<div class="flex gap-4 text-sm">
				<div>
					<span class="text-muted-foreground">Créé le :</span>
					{formatDate(new Date(data.link.createdAt))}
				</div>
				{#if data.link.expiresAt}
					<div>
						<span class="text-muted-foreground">Expire le :</span>
						{formatDate(new Date(data.link.expiresAt))}
					</div>
				{/if}
			</div>

			<div class="flex gap-2">
				{#if data.link.password}
					<Badge variant="secondary">Protégé par mot de passe</Badge>
				{/if}
				{#if data.link.expiresAt}
					{#if new Date() > new Date(data.link.expiresAt)}
						<Badge variant="destructive">Expiré</Badge>
					{:else}
						<Badge variant="default"
							>Actif jusqu'au {formatDate(new Date(data.link.expiresAt))}</Badge
						>
					{/if}
				{:else}
					<Badge variant="default">Permanent</Badge>
				{/if}
			</div>
		</CardContent>
	</Card>

	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total des clics</CardTitle>
				<Eye class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatNumber(data.stats.totalClicks)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.clicksToday > 0 ? `+${data.stats.clicksToday}` : '0'} aujourd'hui
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Cette semaine</CardTitle>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatNumber(data.stats.clicksThisWeek)}</div>
				<p class="text-xs text-muted-foreground">7 derniers jours</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Ce mois</CardTitle>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatNumber(data.stats.clicksThisMonth)}</div>
				<p class="text-xs text-muted-foreground">30 derniers jours</p>
			</CardContent>
		</Card>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Historique des clics récents</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.recentClicks.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					<p>Aucun clic enregistré pour ce lien.</p>
				</div>
			{:else}
				<div class="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date et heure</TableHead>
								<TableHead>IP</TableHead>
								<TableHead>Navigateur</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each data.recentClicks as click (click.id)}
								<TableRow>
									<TableCell class="font-medium">
										{formatDate(new Date(click.createdAt))}
									</TableCell>
									<TableCell class="font-mono text-sm">
										{click.ip || 'Non disponible'}
									</TableCell>
									<TableCell class="text-sm text-muted-foreground max-w-xs truncate">
										{click.userAgent || 'Non disponible'}
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				{#if data.stats.totalClicks > data.recentClicks.length}
					<p class="text-sm text-muted-foreground mt-4 text-center">
						Affichage des {data.recentClicks.length} clics les plus récents sur {formatNumber(
							data.stats.totalClicks
						)} au total
					</p>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>
