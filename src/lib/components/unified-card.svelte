<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';
	import { CheckCircle, TrendingUp, Component } from 'lucide-svelte';

	interface BadgeItem {
		content: string;
		variant?: BadgeVariant;
		class?: string;
	}

	interface FeatureCardProps {
		icon: typeof Component;
		color: string;
		title: string;
		description: string;
		badge: string;
		badgeIcon?: typeof Component;
	}

	interface StatCardProps {
		title: string;
		value: string | number;
		icon: typeof Component;
		color: string;
		badges?: BadgeItem[];
		growthRate?: string | number | null;
		children?: any;
	}

	type UnifiedCardProps =
		| (FeatureCardProps & { type: 'feature' })
		| (StatCardProps & { type: 'stat' });

	let props: UnifiedCardProps = $props();

	const colorMap: Record<
		string,
		{ bg: string; darkBg: string; text: string; darkText: string; gradient: string }
	> = {
		blue: {
			bg: 'bg-blue-100',
			darkBg: 'dark:bg-blue-900/30',
			text: 'text-blue-600',
			darkText: 'dark:text-blue-400',
			gradient: 'from-blue-600 to-blue-400'
		},
		green: {
			bg: 'bg-green-100',
			darkBg: 'dark:bg-green-900/30',
			text: 'text-green-600',
			darkText: 'dark:text-green-400',
			gradient: 'from-green-600 to-green-400'
		},
		purple: {
			bg: 'bg-purple-100',
			darkBg: 'dark:bg-purple-900/30',
			text: 'text-purple-600',
			darkText: 'dark:text-purple-400',
			gradient: 'from-purple-600 to-purple-400'
		},
		red: {
			bg: 'bg-red-100',
			darkBg: 'dark:bg-red-900/30',
			text: 'text-red-600',
			darkText: 'dark:text-red-400',
			gradient: 'from-red-600 to-red-400'
		},
		yellow: {
			bg: 'bg-yellow-100',
			darkBg: 'dark:bg-yellow-900/30',
			text: 'text-yellow-600',
			darkText: 'dark:text-yellow-400',
			gradient: 'from-yellow-600 to-yellow-400'
		},
		indigo: {
			bg: 'bg-indigo-100',
			darkBg: 'dark:bg-indigo-900/30',
			text: 'text-indigo-600',
			darkText: 'dark:text-indigo-400',
			gradient: 'from-indigo-600 to-indigo-400'
		},
		pink: {
			bg: 'bg-pink-100',
			darkBg: 'dark:bg-pink-900/30',
			text: 'text-pink-600',
			darkText: 'dark:text-pink-400',
			gradient: 'from-pink-600 to-pink-400'
		},
		gray: {
			bg: 'bg-gray-100',
			darkBg: 'dark:bg-gray-900/30',
			text: 'text-gray-600',
			darkText: 'dark:text-gray-400',
			gradient: 'from-gray-600 to-gray-400'
		},
		orange: {
			bg: 'bg-orange-100',
			darkBg: 'dark:bg-orange-900/30',
			text: 'text-orange-600',
			darkText: 'dark:text-orange-400',
			gradient: 'from-orange-600 to-orange-400'
		},
		teal: {
			bg: 'bg-teal-100',
			darkBg: 'dark:bg-teal-900/30',
			text: 'text-teal-600',
			darkText: 'dark:text-teal-400',
			gradient: 'from-teal-600 to-teal-400'
		}
	};

	let currentColor = colorMap[props.color] || colorMap.blue;
</script>

{#if props.type === 'feature'}
	<Card.Root class="relative overflow-hidden hover:shadow-lg transition-shadow">
		<Card.Content class="p-6">
			<div
				class="w-12 h-12 {currentColor.bg} {currentColor.darkBg} rounded-xl flex items-center justify-center mb-4"
			>
				<props.icon class="w-6 h-6 {currentColor.text} {currentColor.darkText}" />
			</div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
				{props.title}
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-4">
				{props.description}
			</p>
			<div class="flex items-center text-sm {currentColor.text} {currentColor.darkText}">
				{#if props.badgeIcon}
					<props.badgeIcon class="w-4 h-4 mr-2" />
				{:else}
					<CheckCircle class="w-4 h-4 mr-2" />
				{/if}
				{props.badge}
			</div>
		</Card.Content>
		<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r {currentColor.gradient}"></div>
	</Card.Root>
{:else if props.type === 'stat'}
	<Card.Root class="relative overflow-hidden">
		<Card.Content class="py-3 p-6">
			<div class="flex items-center justify-between">
				<div class="space-y-2 flex-1">
					<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{props.title}</p>
					<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
						{props.value}
					</p>
					<div class="flex flex-wrap items-center gap-2">
						{#if props.badges}
							{#each props.badges as badge}
								<Badge variant={badge.variant || 'secondary'} class="text-xs {badge.class || ''}">
									{badge.content}
								</Badge>
							{/each}
						{/if}
						{#if props.growthRate && Number(props.growthRate) > 0}
							<div class="flex items-center gap-1">
								<TrendingUp class="w-3 h-3 text-green-500" />
								<span class="text-xs text-green-600 font-medium">+{props.growthRate}%</span>
							</div>
						{/if}
						{#if props.children}
							{@render props.children()}
						{/if}
					</div>
				</div>
				<div
					class="w-12 h-12 {currentColor.bg} {currentColor.darkBg} rounded-xl flex items-center justify-center"
				>
					<props.icon class="w-6 h-6 {currentColor.text} {currentColor.darkText}" />
				</div>
			</div>
		</Card.Content>
		<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r {currentColor.gradient}"></div>
	</Card.Root>
{/if}
