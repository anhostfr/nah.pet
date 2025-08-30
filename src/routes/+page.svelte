<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import UnifiedCard from '$lib/components/unified-card.svelte';
	import {
		Link,
		ChartBar,
		Globe,
		Shield,
		ArrowRight,
		Eye,
		Users,
		Clock,
		Key,
		Languages,
		Code,
		Github,
		ExternalLink
	} from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	const features = [
		{
			icon: Link,
			color: 'blue',
			title: m.url_shortening_title(),
			description: m.url_shortening_description(),
			badge: m.custom_slugs_badge()
		},
		{
			icon: Shield,
			color: 'red',
			title: m.password_protection_title(),
			description: m.password_protection_description(),
			badge: m.protected_link()
		},
		{
			icon: Clock,
			color: 'orange',
			title: m.expiration_title(),
			description: m.expiration_description(),
			badge: m.temporal_control_badge()
		},
		{
			icon: ChartBar,
			color: 'green',
			title: m.detailed_analytics_title(),
			description: m.detailed_analytics_description(),
			badge: m.real_time_badge(),
			badgeIcon: Eye
		},
		{
			icon: Globe,
			color: 'purple',
			title: m.custom_domains_title_feature(),
			description: m.custom_domains_description(),
			badge: m.complete_isolation_badge()
		},
		{
			icon: Users,
			color: 'indigo',
			title: m.administration_title(),
			description: m.administration_description(),
			badge: m.access_control_badge()
		},
		{
			icon: Key,
			color: 'yellow',
			title: m.api_rest_title(),
			description: m.api_rest_description(),
			badge: m.openapi_badge(),
			badgeIcon: Code
		},
		{
			icon: Languages,
			color: 'teal',
			title: m.multilingual_title(),
			description: m.multilingual_description(),
			badge: m.typesafe_i18n_badge()
		}
	];

	const endpoints = [
		{ method: 'GET', path: '/api/v1/links' },
		{ method: 'POST', path: '/api/v1/links' },
		{ method: 'GET', path: '/api/v1/stats' },
		{ method: 'POST', path: '/api/v1/links/bulk' }
	];

	const sdks = ['TypeScript', 'Python', 'Go', 'Java', 'Etc...'];
</script>

<svelte:head>
	<title>🐾 {m.nahpet()} - {m.url_shortener_tagline()}</title>
	<meta
		name="description"
		content="{m.nahpet()} - {m.url_shortener_tagline()}"
	/>
</svelte:head>

<div class="space-y-16 sm:space-y-20">
	<section class="text-center space-y-6 sm:space-y-8 py-8 sm:py-12">
		<div class="flex flex-wrap justify-center gap-2 mb-6">
			<Badge variant="outline" class="text-xs font-medium">
				🐾 {m.nahpet()}
			</Badge>
			<Badge variant="outline" class="text-xs font-medium">
				<Globe class="w-3 h-3 mr-1" />
				{m.open_source()}
			</Badge>
			<Badge variant="outline" class="text-xs font-medium">MIT License</Badge>
		</div>

		<div class="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
			<h1
				class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
			>
				🐾 {m.nahpet()}
			</h1>
			<p class="text-xl sm:text-2xl text-primary font-medium mb-4">
				"{m.nahpet_tagline()}" ✨
			</p>
			<p
				class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
			>
				{m.nahpet_description()} avec domaines personnalisés, analyses détaillées et API complète.
				{m.created_with_sveltekit()}
			</p>

			<div class="bg-secondary/15 rounded-xl p-6 max-w-3xl mx-auto border border-border">
				<div class="flex flex-col sm:flex-row items-center gap-4">
					<div class="flex-1 min-w-0 max-w-full">
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{m.long_url_label()}</p>
						<code
							class="text-sm text-secondary-foreground bg-white dark:bg-gray-900 px-3 py-2 rounded-lg block truncate border"
						>
							https://www.example.com/very/long/path/with/many/parameters?utm_source=newsletter&amp;utm_campaign=launch
						</code>
					</div>
					<div class="lg:mt-5">
						<ArrowRight class="w-5 h-5 text-accent/90 max-md:rotate-90" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm text-gray-600 dark:text-gray-400 0 mb-1">{m.short_url_label()}</p>
						<code
							class="text-sm text-accent/90 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg block font-semibold border"
						>
							nah.pet/launch2025
						</code>
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
			{#if data.user}
				<Button href="/dashboard" size="lg" class="text-base px-8">
					{m.dashboard()}
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
			{:else}
				<Button href="/register" size="lg" class="text-base px-8">
					{m.get_started()}
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
				<Button href="/login" variant="outline" size="lg" class="text-base px-8">
					{m.login()}
				</Button>
			{/if}
			<Button href="/doc" variant="outline" size="lg" class="text-base px-8">
				{m.api_documentation_link()}
				<ExternalLink class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</section>

	<section class="space-y-8 sm:space-y-12">
		<div class="text-center space-y-4">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
				{m.features_title()}
			</h2>
			<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
				{m.features_description()}
			</p>
		</div>

		<div class="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each features as feature}
				<UnifiedCard type="feature" {...feature} />
			{/each}
		</div>
	</section>

	<section class="space-y-8 sm:space-y-12">
		<div class="text-center space-y-4">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
				{m.api_section_title()}
			</h2>
			<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
				{m.api_section_description()}
			</p>
		</div>

		<div class="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Content class="p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
						{m.main_endpoints_title()}
					</h3>
					<div class="space-y-2 text-sm">
						{#each endpoints as endpoint}
							<div class="flex items-center">
								<Badge variant="outline" class="mr-2 text-xs">{endpoint.method}</Badge>
								<code class="text-gray-600 dark:text-gray-400">{endpoint.path}</code>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
						{m.authentication_title()}
					</h3>
					<p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
						{m.authentication_description()}
					</p>
					<div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
						<code class="text-xs text-gray-800 dark:text-gray-200">
							Authorization: Bearer YOUR_API_KEY
						</code>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<h3 class="text-lg font-semibold mb-3">{m.sdk_generation_title()}</h3>
					<p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
						{m.sdk_generation_description()}
					</p>
					<div class="space-y-2 space-x-1.5">
						{#each sdks as sdk}
							<Badge variant="secondary" class="text-xs">{sdk}</Badge>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="text-center">
			<Button href="/doc" size="lg" class="text-base px-8">
				{m.view_complete_docs()}
				<ExternalLink class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</section>

	{#if !data.user}
		<section class="text-center space-y-6 sm:space-y-8 py-8">
			<div class="space-y-4">
				<h2 class="text-3xl sm:text-4xl font-bold">
					{m.ready_to_start_title()}
				</h2>
				<p class="text-lg max-w-2xl mx-auto">
					{m.ready_to_start_description()}
				</p>
			</div>

			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<Button href="/register" size="lg" class="text-base px-8">
					{m.start_with_nahpet()}
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
				<Button href="/login" variant="outline" size="lg" class="text-base px-8">
					{m.login()}
				</Button>
				<Button
					href="https://github.com/anhostft/nah.pet"
					variant="outline"
					size="lg"
					class="text-base px-8"
				>
					<Github class="w-4 h-4 mr-2" />
					GitHub
				</Button>
			</div>
		</section>
	{/if}

	<footer class="py-8 border-t border-border">
		<div class="max-w-4xl mx-auto">
			<div class="flex flex-wrap justify-center gap-6 mb-6">
				<Button href="/doc" variant="ghost" size="sm">
					{m.api_documentation_link()}
				</Button>
				<Button href="https://github.com/anhostfr/nah.pet" variant="ghost" size="sm">
					<Github class="w-4 h-4 mr-1" />
					{m.source_code_link()}
				</Button>
				<Button href="https://github.com/anhostfr/nah.pet/issues" variant="ghost" size="sm">
					{m.report_bug_link()}
				</Button>
				<Button href="https://github.com/anhostfr/nah.pet/releases" variant="ghost" size="sm">
					{m.versions_link()}
				</Button>
			</div>

			<div class="text-center text-gray-600 dark:text-gray-400 text-sm">
				<p class="mb-2">
					<em>{m.footer_tagline()}</em>
				</p>
				<p>
					{m.footer_license()}
				</p>
			</div>
		</div>
	</footer>
</div>
