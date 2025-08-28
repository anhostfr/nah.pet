<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LinksTable from '$lib/components/links-table.svelte';
	import UrlShortenerForm from '$lib/components/url-shortener-form.svelte';
	import UnifiedCard from '$lib/components/unified-card.svelte';
	import { Link, ChartBar, Eye, Calendar, Activity, Users, Globe } from 'lucide-svelte';
	import { formatNumber } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData, PageServerData } from './$types';
	import type { NormalizedActionData } from '$lib/types';

	let { data, form }: { data: PageServerData; form: (ActionData & NormalizedActionData) | null } =
		$props();

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

	const statsCards = [
		{
			title: m.total_links(),
			value: formatNumber(data.stats.totalLinks),
			icon: Link,
			color: 'blue',
			badges: [{ content: `+${data.stats.linksThisMonth} ce mois` }],
			growthRate
		},
		{
			title: m.total_clicks(),
			value: formatNumber(data.stats.totalClicks),
			icon: Eye,
			color: 'green',
			badges: [{ content: `+${data.stats.clicksThisMonth} ${m.this_month_label()}` }],
			growthRate: clickGrowthRate
		},
		{
			title: m.average_clicks(),
			value: data.stats.totalLinks > 0 ? Math.round(data.stats.totalClicks / data.stats.totalLinks) : 0,
			icon: ChartBar,
			color: 'purple',
			badges: [{ content: m.per_link() }]
		},
		{
			title: m.active_links(),
			value: formatNumber(data.stats.activeLinks),
			icon: Calendar,
			color: 'orange',
			badges: [
				{
					variant: 'outline' as const,
					content: `✓ ${m.active_links_badge()}`,
					class: 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-300'
				},
				...(data.stats.expiredLinks > 0 ? [{
					variant: 'outline' as const,
					content: `${data.stats.expiredLinks} ${m.expired_links_badge()}`,
					class: 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-300'
				}] : [])
			]
		}
	];
</script>

<svelte:head>
	<title>{m.dashboard_title()}</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.dashboard()}</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				{m.dashboard_overview()}
			</p>
		</div>
		<div class="flex items-center space-x-3 flex-wrap gap-2">
			<Badge variant="outline" class="text-xs">
				<Activity class="w-3 h-3 mr-1" />
				{m.real_time()}
			</Badge>
			<Button href="/stats" variant="outline" size="sm">
				<ChartBar class="w-4 h-4 mr-2" />
				<span class="hidden sm:inline">{m.detailed_analytics()}</span>
				<span class="sm:hidden">{m.analytics()}</span>
			</Button>
		</div>
	</div>

	<div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		{#each statsCards as card}
			<UnifiedCard type="stat" {...card} />
		{/each}
	</div>

	<Card.Root>
		<Card.Header class="border-b border-gray-100 dark:border-gray-700">
			<Card.Title class="flex items-center space-x-2">
				<div
					class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
				>
					<Link class="w-4 h-4 text-blue-600 dark:text-blue-400" />
				</div>
				<span>{m.create_new_link()}</span>
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
						<ChartBar class="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</div>
					<span>{m.my_links()}</span>
					<Badge variant="secondary" class="ml-2">
						{data.links.length}
					</Badge>
				</Card.Title>
				<Button href="/stats" variant="outline" size="sm">
					<Eye class="w-4 h-4 mr-2" />
					<span class="hidden sm:inline">{m.view_all()}</span>
					<span class="sm:hidden">{m.view_all()}</span>
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
						<h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">{m.tip_of_day()}</h3>
						<p class="text-sm text-blue-800 dark:text-blue-200">
							{m.tip_custom_slugs()}
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
							{m.open_source_project()}
						</h3>
						<p class="text-sm text-green-800 dark:text-green-200">
							{m.contribute_github()}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
