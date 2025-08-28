<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChartBar, Eye, Calendar, ExternalLink, ArrowLeft } from 'lucide-svelte';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages.js';
	import { PUBLIC_MAIN_DOMAIN } from '$env/static/public';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.analytics()} - /{data.link.slug} - Nah.pet</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center gap-4">
		<Button href="/" variant="ghost" size="sm">
			<ArrowLeft class="h-4 w-4 mr-2" />
			{m.back()}
		</Button>
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold">{m.detailed_analytics()}</h1>
			<p class="text-muted-foreground break-all">
				{m.performance_analysis({
					domain: data.link.customDomain ? `${data.link.customDomain.domain}/` : '/',
					slug: data.link.slug
				})}
			</p>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<ChartBar class="h-5 w-5" />
				{m.link_info()}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m.shorten_link()}</p>
					<div class="flex items-center gap-2 flex-wrap">
						<code class="text-sm bg-muted px-2 py-1 rounded break-all">
							{data.link.customDomain
								? `https://${data.link.customDomain.domain}/${data.link.slug}`
								: `${PUBLIC_MAIN_DOMAIN}/${data.link.slug}`}
						</code>
						<Button
							variant="ghost"
							size="sm"
							href={data.link.customDomain
								? `https://${data.link.customDomain.domain}/${data.link.slug}`
								: `/${data.link.slug}`}
							target="_blank"
						>
							<ExternalLink class="h-3 w-3" />
						</Button>
					</div>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m.original_url()}</p>
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
					<p class="text-sm font-medium text-muted-foreground">{m.title()}</p>
					<p class="text-sm">{data.link.title}</p>
				</div>
			{/if}

			<div class="flex gap-4 text-sm">
				<div>
					<span class="text-muted-foreground">{m.created_on()}</span>
					{formatDate(new Date(data.link.createdAt))}
				</div>
				{#if data.link.expiresAt}
					<div>
						<span class="text-muted-foreground">{m.expires_on()}</span>
						{formatDate(new Date(data.link.expiresAt))}
					</div>
				{/if}
			</div>

			<div class="flex gap-2">
				{#if data.link.password}
					<Badge variant="secondary">{m.password_protected()}</Badge>
				{/if}
				{#if data.link.expiresAt}
					{#if new Date() > new Date(data.link.expiresAt)}
						<Badge variant="destructive">{m.expired()}</Badge>
					{:else}
						<Badge variant="default"
							>{m.active_until({
								date: formatDate(new Date(data.link.expiresAt))
							})}</Badge
						>
					{/if}
				{:else}
					<Badge variant="default">{m.permanent()}</Badge>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{m.total_clicks()}</Card.Title>
				<Eye class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatNumber(data.stats.totalClicks)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.clicksToday > 0 ? `+${data.stats.clicksToday}` : '0'}
					{m.today().toLowerCase()}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{m.this_week()}</Card.Title>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatNumber(data.stats.clicksThisWeek)}</div>
				<p class="text-xs text-muted-foreground">{m.last_7_days()}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{m.this_month_stat()}</Card.Title>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatNumber(data.stats.clicksThisMonth)}</div>
				<p class="text-xs text-muted-foreground">{m.last_30_days()}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{m.recent_clicks_history()}</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.recentClicks.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					<p>{m.no_clicks_recorded()}</p>
				</div>
			{:else}
				<div class="rounded-md border overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.date_time_column()}</Table.Head>
								<Table.Head class="hidden sm:table-cell">IP</Table.Head>
								<Table.Head class="hidden md:table-cell">{m.browser_column()}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.recentClicks as click (click.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div>
											{formatDate(new Date(click.createdAt))}
										</div>
										<div class="sm:hidden mt-1 space-y-1">
											<div class="text-xs text-muted-foreground font-mono">
												IP: {click.ip || m.not_available()}
											</div>
											<div class="text-xs text-muted-foreground truncate max-w-xs md:hidden">
												{click.userAgent || m.not_available()}
											</div>
										</div>
									</Table.Cell>
									<Table.Cell class="font-mono text-sm hidden sm:table-cell">
										{click.ip || m.not_available()}
									</Table.Cell>
									<Table.Cell
										class="text-sm text-muted-foreground max-w-xs truncate hidden md:table-cell"
									>
										{click.userAgent || m.not_available()}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				{#if data.stats.totalClicks > data.recentClicks.length}
					<p class="text-sm text-muted-foreground mt-4 text-center">
						{m.showing_recent_clicks({
							shown: data.recentClicks.length,
							total: formatNumber(data.stats.totalClicks)
						})}
					</p>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
</div>
