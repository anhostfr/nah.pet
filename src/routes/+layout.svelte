<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Link, User, BarChart3, Settings, Globe } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher, userPrefersMode } from 'mode-watcher';

	let { children, data } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: BarChart3, active: $page.url.pathname === '/' },
		{
			href: '/stats',
			label: 'Analytics',
			icon: BarChart3,
			active: $page.url.pathname.startsWith('/stats')
		},
		{
			href: '/settings',
			label: 'Paramètres',
			icon: Settings,
			active: $page.url.pathname === '/settings'
		}
	];
</script>

<svelte:head>
	<title>ShortURL - Raccourcisseur d'URL Open Source</title>
	<meta
		name="description"
		content="Interface moderne pour raccourcir vos URLs avec analytics avancées"
	/>
</svelte:head>

<ModeWatcher defaultMode={'dark'} />
<div class="min-h-screen bg-primary-foreground">
	<header class="border-b bg-primary-foreground sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<div class="flex items-center space-x-4">
					<a href="/" class="flex items-center space-x-3 group">
					<img src="/favicon.webp" alt="Nah.pet Logo" class="w-10 h-10 object-contain" />
						<div>
							<h1 class="text-xl font-bold text-gray-900 dark:text-white">Nah.pet</h1>
							<p class="text-xs text-gray-500 dark:text-gray-400">Open Source URL Shortener</p>
						</div>
					</a>
					<Badge variant="outline" class="text-xs font-medium">
						<Globe class="w-3 h-3 mr-1" />
						Open Source
					</Badge>
				</div>

				<div class="flex items-center space-x-3">
					{#if data.user}
						<div class="hidden md:flex items-center space-x-1">
							{#each navItems as item}
								<Button
									href={item.href}
									variant="ghost"
									class="flex items-center space-x-2 mx-1 my-1 text-sm font-medium rounded-lg transition-all"
								>
									<item.icon class="w-4 h-4" />
									<span>{item.label}</span>
								</Button>
							{/each}
						</div>

						<div
							class="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700"
						>
							<div class="text-right hidden sm:block">
								<p class="text-sm font-medium text-gray-900 dark:text-white">Connecté</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{data.user.email}</p>
							</div>
							<div
								class="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center"
							>
								<User class="w-4 h-4 text-gray-600 dark:text-gray-300" />
							</div>
							<form method="POST" action="/logout">
								<Button variant="ghost" size="sm" type="submit">Déconnexion</Button>
							</form>
						</div>
					{:else}
						<div class="flex items-center space-x-3">
							<Button href="/login" variant="ghost" size="sm">Connexion</Button>
							<Button href="/register" size="sm">Commencer</Button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>
</div>

<Toaster />
