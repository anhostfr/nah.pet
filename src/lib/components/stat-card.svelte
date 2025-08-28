<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';
	import { TrendingUp, Component } from 'lucide-svelte';
	interface BadgeItem {
		content: string;
		variant?: BadgeVariant;
		class?: string;
	}

	export interface StatCardProps {
		title: string;
		value: string | number;
		icon: typeof Component;
		color: string;
		badges?: BadgeItem[];
		growthRate?: string | number | null;
		children?: any;
	}

	let {
		title,
		value,
		icon: IconComponent,
		color,
		badges = [],
		growthRate = null,
		children = null
	}: StatCardProps = $props();
</script>

<Card.Root class="relative overflow-hidden">
	<Card.Content class="py-3 p-6">
		<div class="flex items-center justify-between">
			<div class="space-y-2 flex-1">
				<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
				<p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
					{@html value}
				</p>
				<div class="flex flex-wrap items-center gap-2">
					{#each badges as badge}
						<Badge variant={badge.variant || 'secondary'} class="text-xs {badge.class || ''}">
							{@html badge.content}
						</Badge>
					{/each}
					{#if growthRate && Number(growthRate) > 0}
						<div class="flex items-center gap-1">
							<TrendingUp class="w-3 h-3 text-green-500" />
							<span class="text-xs text-green-600 font-medium">+{growthRate}%</span>
						</div>
					{/if}
					{#if children}
						{@render children()}
					{/if}
				</div>
			</div>
			<div class="w-12 h-12 bg-{color}-100 dark:bg-{color}-900/30 rounded-xl flex items-center justify-center">
				<IconComponent class="w-6 h-6 text-{color}-600 dark:text-{color}-400" />
			</div>
		</div>
	</Card.Content>
	<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-{color}-600 to-{color}-400"></div>
</Card.Root>