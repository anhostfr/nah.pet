<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { CheckCircle, Component } from 'lucide-svelte';

	interface FeatureCardProps {
		icon: typeof Component;
		color: string;
		title: string;
		description: string;
		badge: string;
		badgeIcon?: typeof Component;
	}

	let {
		icon: IconComponent,
		color,
		title,
		description,
		badge,
		badgeIcon: BadgeIconComponent = CheckCircle
	}: FeatureCardProps = $props();
</script>

<Card.Root class="relative overflow-hidden hover:shadow-lg transition-shadow">
	<Card.Content class="p-6">
		<div class="w-12 h-12 bg-{color}-100 dark:bg-{color}-900/30 rounded-xl flex items-center justify-center mb-4">
			<IconComponent class="w-6 h-6 text-{color}-600 dark:text-{color}-400" />
		</div>
		<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
			{title}
		</h3>
		<p class="text-gray-600 dark:text-gray-400 mb-4">
			{description}
		</p>
		<div class="flex items-center text-sm text-{color}-600 dark:text-{color}-400">
			<BadgeIconComponent class="w-4 h-4 mr-2" />
			{badge}
		</div>
	</Card.Content>
	<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-{color}-600 to-{color}-400"></div>
</Card.Root>