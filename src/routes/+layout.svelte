<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { User, Settings, Globe, ChartBar, ExternalLink, Menu, X, Languages } from 'lucide-svelte';
	import { page } from '$app/state';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSelector from '$lib/components/language-selector.svelte';
	import { slide } from 'svelte/transition';

	let { children, data } = $props();
	let mobileMenuOpen = $state(false);

	const navItems = [
		{
			href: '/dashboard',
			label: m.dashboard(),
			icon: ChartBar,
			active: page.url.pathname === '/dashboard'
		},
		{
			href: '/stats',
			label: m.analytics(),
			icon: ChartBar,
			active: page.url.pathname.startsWith('/stats')
		},
		{
			href: '/domains',
			label: m.domains(),
			icon: ExternalLink,
			active: page.url.pathname.startsWith('/domains')
		},
		{
			href: '/settings',
			label: m.settings(),
			icon: Settings,
			active: page.url.pathname === '/settings'
		}
	];
</script>

<svelte:head>
	<title>{m.nahpet_tagline()}</title>
	<meta name="description" content={m.nahpet_description()} />
</svelte:head>

<ModeWatcher defaultMode={'dark'} />
<div class="min-h-screen bg-primary-foreground">
	<header class="border-b bg-primary-foreground sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<div class="flex items-center space-x-2 sm:space-x-4">
					<a href="/" class="flex items-center space-x-2 sm:space-x-3 group">
						<img
							src="/favicon.webp"
							alt={m.nahpet_logo()}
							class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
						/>
						<div>
							<h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
								{m.nahpet()}
							</h1>
							<p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
								{m.url_shortener_tagline()}
							</p>
						</div>
					</a>
					<Badge
						variant="outline"
						class="text-xs font-medium hidden sm:inline-flex mr-2"
						href="https://github.com/anhostfr/nah.pet"
					>
						<Globe class="w-3 h-3 mr-1" />
						{m.open_source()}
					</Badge>
				</div>

				<div class="flex items-center space-x-2 sm:space-x-3">
					<LanguageSelector />

					{#if data.user}
						<div class="hidden lg:flex items-center space-x-1">
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

						<Button
							variant="ghost"
							size="sm"
							class="lg:hidden"
							onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						>
							{#if mobileMenuOpen}
								<X class="w-4 h-4" />
							{:else}
								<Menu class="w-4 h-4" />
							{/if}
						</Button>

						<div
							class="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700"
						>
							<div class="text-right hidden md:block">
								<p class="text-sm font-medium text-gray-900 dark:text-white">{m.connected()}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 max-w-24 truncate">
									{data.user.email}
								</p>
							</div>
							<div
								class="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center"
							>
								<User class="w-4 h-4 text-gray-600 dark:text-gray-300" />
							</div>
							<form method="POST" action="/logout" class="hidden sm:block">
								<Button variant="ghost" size="sm" type="submit">{m.logout()}</Button>
							</form>
						</div>
					{:else}
						<div class="flex items-center space-x-2 sm:space-x-3">
							<Button href="/login" variant="ghost" size="sm" class="text-sm">{m.login()}</Button>
							<Button href="/register" size="sm" class="text-sm">{m.get_started()}</Button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if data.user && mobileMenuOpen}
			<div class="lg:hidden bg-primary-foreground border-t border-border" transition:slide>
				<div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
					<nav class="space-y-2">
						{#each navItems as item}
							<a
								href={item.href}
								class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
								class:bg-secondary={item.active}
								onclick={() => (mobileMenuOpen = false)}
							>
								<item.icon class="w-5 h-5" />
								<span class="font-medium">{item.label}</span>
							</a>
						{/each}
						<div class="pt-2 border-t border-border">
							<form method="POST" action="/logout" class="w-full">
								<button
									type="submit"
									class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors w-full text-left"
								>
									<User class="w-5 h-5" />
									<span class="font-medium">{m.logout()}</span>
								</button>
							</form>
						</div>
					</nav>
				</div>
			</div>
		{/if}
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
		{@render children()}
	</main>
</div>

<Toaster />
