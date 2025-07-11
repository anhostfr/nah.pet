<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LinksTable from '$lib/components/links-table.svelte';
	import UrlShortenerForm from '$lib/components/url-shortener-form.svelte';
	import {
		Link,
		BarChart3,
		Eye,
		Calendar,
		TrendingUp,
		Activity,
		Users,
		Globe
	} from 'lucide-svelte';
	import { formatNumber } from '$lib/utils.js';

	let { data, form } = $props();

	const growthRate =
		data.stats.linksThisMonth > 0
			? (
					(data.stats.linksThisMonth /
						Math.max(data.stats.totalLinks - data.stats.linksThisMonth, 1)) *
					100
				).toFixed(1)
			: 0;

	const clickGrowthRate =
		data.stats.clicksThisMonth > 0
			? (
					(data.stats.clicksThisMonth /
						Math.max(data.stats.totalClicks - data.stats.clicksThisMonth, 1)) *
					100
				).toFixed(1)
			: 0;
</script>

<svelte:head>
	<title>Dashboard - ShortURL</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				Vue d'ensemble de vos liens raccourcis et performances
			</p>
		</div>
		<div class="flex items-center space-x-3 flex-wrap gap-2">
			<Badge variant="outline" class="text-xs">
				<Activity class="w-3 h-3 mr-1" />
				En temps réel
			</Badge>
			<Button href="/stats" variant="outline" size="sm">
				<BarChart3 class="w-4 h-4 mr-2" />
				<span class="hidden sm:inline">Analytics détaillées</span>
				<span class="sm:hidden">Analytics</span>
			</Button>
		</div>
	</div>

	<div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root class="relative overflow-hidden">
			<Card.Content class="py-3">
				<div class="flex items-center justify-between">
					<div class="space-y-2 flex-1">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total des liens</p>
						<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.totalLinks)}
						</p>
						<div class="flex flex-wrap items-center gap-2">
							<Badge variant="secondary" class="text-xs">
								+{data.stats.linksThisMonth} ce mois
							</Badge>
							{#if Number(growthRate) > 0}
								<div class="flex items-center gap-1">
									<TrendingUp class="w-3 h-3 text-green-500" />
									<span class="text-xs text-green-600 font-medium">+{growthRate}%</span>
								</div>
							{/if}
						</div>
					</div>
					<div
						class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
					>
						<Link class="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
				</div>
			</Card.Content>
			<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="py-3">
				<div class="flex items-center justify-between">
					<div class="space-y-2 flex-1">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total des clics</p>
						<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.totalClicks)}
						</p>
						<div class="flex flex-wrap items-center gap-2">
							<Badge variant="secondary" class="text-xs">
								+{data.stats.clicksThisMonth} ce mois
							</Badge>
							{#if Number(clickGrowthRate) > 0}
								<div class="flex items-center gap-1">
									<TrendingUp class="w-3 h-3 text-green-500" />
									<span class="text-xs text-green-600 font-medium">+{clickGrowthRate}%</span>
								</div>
							{/if}
						</div>
					</div>
					<div
						class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
					>
						<Eye class="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
				</div>
			</Card.Content>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-600 to-green-400"
			></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Clics moyens</p>
						<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
							{data.stats.totalLinks > 0
								? Math.round(data.stats.totalClicks / data.stats.totalLinks)
								: 0}
						</p>
						<Badge variant="secondary" class="text-xs">par lien</Badge>
					</div>
					<div
						class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
					>
						<BarChart3 class="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</Card.Content>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400"
			></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Liens actifs</p>
						<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.activeLinks)}
						</p>
						<div class="flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								class="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
							>
								✓ Actifs
							</Badge>
							{#if data.stats.expiredLinks > 0}
								<Badge
									variant="outline"
									class="text-xs border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
								>
									{data.stats.expiredLinks} expirés
								</Badge>
							{/if}
						</div>
					</div>
					<div
						class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center"
					>
						<Calendar class="w-6 h-6 text-orange-600 dark:text-orange-400" />
					</div>
				</div>
			</Card.Content>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-600 to-orange-400"
			></div>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header class="border-b border-gray-100 dark:border-gray-700">
			<Card.Title class="flex items-center space-x-2">
				<div
					class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
				>
					<Link class="w-4 h-4 text-blue-600 dark:text-blue-400" />
				</div>
				<span>Créer un nouveau lien</span>
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-6">
			<UrlShortenerForm {form} customDomains={data.customDomains} />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="border-b border-gray-100 dark:border-gray-700">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<Card.Title class="flex items-center space-x-2">
					<div
						class="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
					>
						<BarChart3 class="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</div>
					<span>Mes liens</span>
					<Badge variant="secondary" class="ml-2">
						{data.links.length}
					</Badge>
				</Card.Title>
				<Button href="/stats" variant="outline" size="sm">
					<Eye class="w-4 h-4 mr-2" />
					<span class="hidden sm:inline">Voir tout</span>
					<span class="sm:hidden">Tout</span>
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<LinksTable links={data.links} />
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
		<Card.Root
			class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
		>
			<Card.Content class="p-6">
				<div class="flex items-start space-x-3">
					<div
						class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
					>
						<Globe class="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Astuce du jour</h3>
						<p class="text-sm text-blue-800 dark:text-blue-200">
							Utilisez des slugs personnalisés pour rendre vos liens plus mémorables et
							professionnels.
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
		>
			<Card.Content class="p-6">
				<div class="flex items-start space-x-3">
					<div
						class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0"
					>
						<Users class="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 class="font-semibold text-green-900 dark:text-green-100 mb-2">
							🚀 Projet Open Source
						</h3>
						<p class="text-sm text-green-800 dark:text-green-200">
							Contribuez au projet sur GitHub ou partagez vos idées d'amélioration !
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
