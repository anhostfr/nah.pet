<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import {
		BarChart3,
		TrendingUp,
		TrendingDown,
		Eye,
		Link,
		Calendar,
		Activity,
		Users,
		Globe,
		ExternalLink,
		Copy,
		ArrowUpRight,
		ArrowDownRight,
		Minus
	} from 'lucide-svelte';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let copied = $state('');

	const copyToClipboard = async (text: string, slug: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copied = slug;
			toast.success('Lien copié !');
			setTimeout(() => (copied = ''), 2000);
		} catch (err) {
			toast.error('Impossible de copier le lien');
		}
	};

	const formatRelativeTime = (date: Date) => {
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "À l'instant";
		if (diffInMinutes < 60) return `Il y a ${diffInMinutes}m`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `Il y a ${diffInHours}h`;

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `Il y a ${diffInDays}j`;

		return formatDate(date);
	};

	const getTrendIcon = (growth: number) => {
		if (growth > 0) return { icon: ArrowUpRight, color: 'text-green-500' };
		if (growth < 0) return { icon: ArrowDownRight, color: 'text-red-500' };
		return { icon: Minus, color: 'text-gray-500' };
	};
</script>

<svelte:head>
	<title>Analytics - ShortURL</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				Analysez les performances de vos liens raccourcis
			</p>
		</div>
		<div class="flex items-center space-x-3">
			<Badge variant="outline" class="text-xs">
				<Activity class="w-3 h-3 mr-1" />
				Données en temps réel
			</Badge>
			<Button href="/" variant="outline" size="sm">
				<Link class="w-4 h-4 mr-2" />
				Retour au Dashboard
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card class="relative overflow-hidden">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Clics aujourd'hui</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.clicksToday)}
						</p>
						<div class="flex items-center space-x-2">
							{#if data.stats.todayGrowth}
								{@const trend = getTrendIcon(data.stats.todayGrowth)}
								<div class="flex items-center space-x-1">
									<trend.icon class="w-3 h-3 {trend.color}" />
									<span class="text-xs font-medium {trend.color}">
										{data.stats.todayGrowth > 0 ? '+' : ''}{data.stats.todayGrowth}%
									</span>
								</div>
								<span class="text-xs text-gray-500">vs hier</span>
							{/if}
						</div>
					</div>
					<div
						class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
					>
						<Eye class="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
				</div>
			</CardContent>
			<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
		</Card>

		<Card class="relative overflow-hidden">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Cette semaine</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.clicksThisWeek)}
						</p>
						<div class="flex items-center space-x-2">
							{#if data.stats.weekGrowth}
								{@const trend = getTrendIcon(data.stats.weekGrowth)}
								<div class="flex items-center space-x-1">
									<trend.icon class="w-3 h-3 {trend.color}" />
									<span class="text-xs font-medium {trend.color}">
										{data.stats.weekGrowth > 0 ? '+' : ''}{data.stats.weekGrowth}%
									</span>
								</div>
								<span class="text-xs text-gray-500">vs semaine passée</span>
							{/if}
						</div>
					</div>
					<div
						class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
					>
						<Calendar class="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
				</div>
			</CardContent>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-600 to-green-400"
			></div>
		</Card>

		<Card class="relative overflow-hidden">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total clics</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.totalClicks)}
						</p>
						<Badge variant="secondary" class="text-xs">Tous vos liens</Badge>
					</div>
					<div
						class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
					>
						<BarChart3 class="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</CardContent>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400"
			></div>
		</Card>

		<Card class="relative overflow-hidden">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Moy. par lien</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.avgClicksPerLink)}
						</p>
						<Badge variant="secondary" class="text-xs">
							{formatNumber(data.stats.totalLinks)} liens
						</Badge>
					</div>
					<div
						class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center"
					>
						<TrendingUp class="w-6 h-6 text-orange-600 dark:text-orange-400" />
					</div>
				</div>
			</CardContent>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-600 to-orange-400"
			></div>
		</Card>
	</div>

	<div class="flex flex-col gap-10">
		<Card>
			<CardHeader class="border-b border-gray-100 dark:border-gray-700">
				<CardTitle class="flex items-center space-x-2">
					<TrendingUp class="w-5 h-5" />
					<span>Top liens</span>
					<Badge variant="secondary" class="ml-2">Plus cliqués</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent class="p-0">
				{#if data.topLinks.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500 dark:text-gray-400">Aucun lien pour l'instant</p>
					</div>
				{:else}
					<div class="mx-6">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead class="w-[50px]">Nom</TableHead>
									<TableHead>Lien</TableHead>
									<TableHead class="text-center w-[80px]">Clics</TableHead>
									<TableHead class="w-[80px]">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each data.topLinks as link, index (link.id)}
									<TableRow class="group">
										<TableCell class="font-mono text-sm text-secondary-foreground">
											{#if link.title}
												{link.title}
											{:else}
												-
											{/if}
										</TableCell>
										<TableCell>
											<div class="space-y-1">
												<div class="flex items-center space-x-2">
													<code class="text-sm bg-secondary px-2 py-1 rounded font-mono">
														/{link.slug}
													</code>
												</div>
											</div>
										</TableCell>
										<TableCell class="text-center">
											<Badge variant="outline" class="font-mono">
												{formatNumber(link._count.clicks)}
											</Badge>
										</TableCell>
										<TableCell>
											<div class="flex items-center space-x-1">
												<Button
													href="/stats/{link.slug}"
													size="sm"
													variant="ghost"
													class="h-8 w-8 p-0"
												>
													<BarChart3 class="w-4 h-4" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onclick={() =>
														copyToClipboard(`${window.location.origin}/${link.slug}`, link.slug)}
													class="h-8 w-8 p-0"
												>
													<Copy class="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="border-b border-gray-100 dark:border-gray-700">
				<CardTitle class="flex items-center space-x-2">
					<Activity class="w-5 h-5" />
					<span>Activité récente</span>
					<Badge variant="secondary" class="ml-2">Derniers clics</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent class="p-6">
				{#if data.recentClicks.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500 dark:text-gray-400">Aucun clic récent</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.recentClicks as click (click.id)}
							<div
								class="flex items-center justify-between p-3 border-border border-[1px] rounded-lg"
							>
								<div class="flex items-center space-x-3">
									<div
										class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
									>
										<Eye class="w-4 h-4 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<div class="flex items-center space-x-2">
											<code class="text-sm font-mono bg-secondary px-2 py-1 rounded">
												/{click.link.slug}
											</code>
											{#if click.link.title}
												<span class="text-sm text-secondary-foreground">
													{click.link.title}
												</span>
											{/if}
										</div>
										<p class="text-xs text-gray-500 truncate max-w-[250px]">
											{click.link.originalUrl}
										</p>
									</div>
								</div>
								<div class="text-right">
									<p class="text-xs text-gray-500">
										{formatRelativeTime(click.createdAt)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
