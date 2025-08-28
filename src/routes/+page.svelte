<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import FeatureCard from '$lib/components/feature-card.svelte';
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
			title: '✂️ Raccourcissement d\'URL',
			description: 'Créez des liens courts avec des slugs personnalisables pour une meilleure identification.',
			badge: 'Slugs personnalisés'
		},
		{
			icon: Shield,
			color: 'red',
			title: '🔐 Protection par mot de passe',
			description: 'Sécurisez vos liens sensibles avec une protection par mot de passe.',
			badge: 'Liens protégés'
		},
		{
			icon: Clock,
			color: 'orange',
			title: '⏰ Expiration automatique',
			description: 'Définissez une date d\'expiration pour vos liens pour un contrôle temporel.',
			badge: 'Contrôle temporel'
		},
		{
			icon: ChartBar,
			color: 'green',
			title: '📊 Analyses détaillées',
			description: 'Statistiques complètes : clics, géolocalisation, navigateurs et plus encore.',
			badge: 'Données en temps réel',
			badgeIcon: Eye
		},
		{
			icon: Globe,
			color: 'purple',
			title: '🌐 Domaines personnalisés',
			description: 'Isolation complète avec vos propres domaines.',
			badge: 'Isolation complète'
		},
		{
			icon: Users,
			color: 'indigo',
			title: '👥 Système d\'administration',
			description: 'Approbation manuelle des utilisateurs et gestion avancée des permissions.',
			badge: 'Contrôle d\'accès'
		},
		{
			icon: Key,
			color: 'yellow',
			title: '🔑 API REST complète',
			description: 'Authentification par clé API avec spécification OpenAPI 3.0 complète.',
			badge: 'OpenAPI 3.0',
			badgeIcon: Code
		},
		{
			icon: Languages,
			color: 'teal',
			title: '🌍 Interface multilingue',
			description: 'Support multilingue avec Paraglide JS et Weblate pour une sécurité de type.',
			badge: 'Type-safe i18n'
		}
	];

	const endpoints = [
		{ method: 'GET', path: '/api/v1/links' },
		{ method: 'POST', path: '/api/v1/links' },
		{ method: 'GET', path: '/api/v1/stats' },
		{ method: 'POST', path: '/api/v1/links/bulk' }
	];

	const sdks = ['TypeScript', 'Python', 'Go', 'Java'];
</script>

<svelte:head>
	<title>🐾 Nah.pet - Raccourcisseur d'URL Open Source</title>
	<meta name="description" content="Nah.pet - Raccourcisseur d'URL open source avec domaines personnalisés, analyses détaillées et API complète. Rewriting paths with bad energy ✨" />
</svelte:head>

<div class="space-y-16 sm:space-y-20">
	<!-- Hero Section -->
	<section class="text-center space-y-6 sm:space-y-8 py-8 sm:py-12">
		<div class="flex flex-wrap justify-center gap-2 mb-6">
			<Badge variant="outline" class="text-xs font-medium">
				🐾 Nah.pet
			</Badge>
			<Badge variant="outline" class="text-xs font-medium">
				<Globe class="w-3 h-3 mr-1" />
				Open Source
			</Badge>
			<Badge variant="outline" class="text-xs font-medium">
				MIT License
			</Badge>
		</div>
		
		<div class="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
				🐾 Nah.pet
			</h1>
			<p class="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
				"Rewriting paths with bad energy" ✨
			</p>
			<p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
				Raccourcisseur d'URL open source avec domaines personnalisés, analyses détaillées et API complète. 
				Créé avec SvelteKit et TypeScript pour des performances optimales.
			</p>
			
			<!-- Example demonstration -->
			<div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 max-w-3xl mx-auto border border-gray-200 dark:border-gray-700">
				<div class="flex flex-col sm:flex-row items-center gap-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm text-gray-500 dark:text-gray-400 mb-1">URL longue :</p>
						<code class="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg block truncate border">
							https://www.example.com/very/long/path/with/many/parameters?utm_source=newsletter&amp;utm_campaign=launch
						</code>
					</div>
					<div class="flex-shrink-0">
						<ArrowRight class="w-5 h-5 text-blue-500 transform rotate-90 sm:rotate-0" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm text-gray-500 dark:text-gray-400 mb-1">URL courte :</p>
						<code class="text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg block font-semibold border">
							nah.pet/launch2024
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
					Commencer
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
				<Button href="/login" variant="outline" size="lg" class="text-base px-8">
					Se connecter
				</Button>
			{/if}
			<Button href="/doc" variant="outline" size="lg" class="text-base px-8">
				📚 Documentation API
				<ExternalLink class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</section>

	<!-- Features Section -->
	<section class="space-y-8 sm:space-y-12">
		<div class="text-center space-y-4">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
				✨ Fonctionnalités
			</h2>
			<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
				Un raccourcisseur d'URL complet avec toutes les fonctionnalités dont vous avez besoin
			</p>
		</div>

		<div class="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each features as feature}
				<FeatureCard {...feature} />
			{/each}
		</div>
	</section>

	<!-- API Section -->
	<section class="space-y-8 sm:space-y-12">
		<div class="text-center space-y-4">
			<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
				🔌 API REST complète
			</h2>
			<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
				Construite avec sveltekit-api et spécification OpenAPI 3.0 complète
			</p>
		</div>

		<div class="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Content class="p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Endpoints principaux</h3>
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
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Authentification</h3>
					<p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
						Utilisez votre clé API dans l'en-tête Authorization
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
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Génération de SDK</h3>
					<p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
						Générez automatiquement des SDKs pour différents langages
					</p>
					<div class="space-y-2">
						{#each sdks as sdk}
							<Badge variant="secondary" class="text-xs">{sdk}</Badge>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="text-center">
			<Button href="/doc" size="lg" class="text-base px-8">
				📚 Voir la documentation complète
				<ExternalLink class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</section>

	<!-- CTA Section -->
	{#if !data.user}
		<section class="text-center space-y-6 sm:space-y-8 py-8">
			<div class="space-y-4">
				<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
					Prêt à commencer ?
				</h2>
				<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
					Créez votre compte gratuitement et commencez à raccourcir vos liens dès maintenant. 
					Open source et auto-hébergeable.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<Button href="/register" size="lg" class="text-base px-8">
					🐾 Commencer avec Nah.pet
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
				<Button href="/login" variant="outline" size="lg" class="text-base px-8">
					Se connecter
				</Button>
				<Button href="https://github.com/your-repo/nah-pet" variant="outline" size="lg" class="text-base px-8">
					<Github class="w-4 h-4 mr-2" />
					GitHub
				</Button>
			</div>
		</section>
	{/if}

	<!-- Footer -->
	<footer class="py-8 border-t border-gray-200 dark:border-gray-700">
		<div class="max-w-4xl mx-auto">
			<!-- Quick links section -->
			<div class="flex flex-wrap justify-center gap-6 mb-6">
				<Button href="/doc" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
					📚 Documentation API
				</Button>
				<Button href="https://github.com/your-repo/nah-pet" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
					<Github class="w-4 h-4 mr-1" />
					Code source
				</Button>
				<Button href="https://github.com/your-repo/nah-pet/issues" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
					🐛 Signaler un bug
				</Button>
				<Button href="https://github.com/your-repo/nah-pet/releases" variant="ghost" size="sm" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
					🏷️ Versions
				</Button>
			</div>
			
			<!-- Tagline and license -->
			<div class="text-center text-gray-500 dark:text-gray-400 text-sm">
				<p class="mb-2">
					<em>"It's a no from us, dawg." – but it's a yes for open source!</em>
				</p>
				<p>
					MIT License • Construit avec ❤️ et SvelteKit • 🐾 Nah.pet
				</p>
			</div>
		</div>
	</footer>
</div>