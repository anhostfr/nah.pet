<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Search } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		items,
		searchFields,
		itemsPerPage = 10,
		searchPlaceholder = m.search_placeholder(),
		children,
		noItemsMessage = m.no_items_found(),
		noSearchResultsMessage = m.no_search_results_for()
	} = $props();

	let searchQuery = $state('');
	let displayedItemsCount = $state(itemsPerPage);

	let filteredItems = $derived(items.filter((item: any) => {
		if (!searchQuery) return true;
		const searchLower = searchQuery.toLowerCase();
		
		return searchFields.some((field: string) => {
			const value = field.split('.').reduce((obj, key) => obj?.[key], item);
			return value && value.toString().toLowerCase().includes(searchLower);
		});
	}));

	let displayedItems = $derived(filteredItems.slice(0, displayedItemsCount));

	const loadMore = () => {
		displayedItemsCount += itemsPerPage;
	};

	const resetPagination = () => {
		displayedItemsCount = itemsPerPage;
	};

	$effect(() => {
		searchQuery;
		resetPagination();
	});
</script>

<div>
	<div class="mb-4">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
			<Input
				bind:value={searchQuery}
				placeholder={searchPlaceholder}
				class="pl-10"
			/>
		</div>
	</div>

	{#if items.length === 0}
		<div class="text-center py-8">
			<p class="text-gray-500 dark:text-gray-400">{noItemsMessage}</p>
		</div>
	{:else if filteredItems.length === 0 && searchQuery}
		<div class="text-center py-8">
			<p class="text-gray-500 dark:text-gray-400">{noSearchResultsMessage} "{searchQuery}"</p>
		</div>
	{:else}
		{@render children(displayedItems)}
		
		{#if displayedItems.length < filteredItems.length}
			<div class="text-center mt-6">
				<Button variant="outline" onclick={loadMore}>
					{m.load_more()} ({m.remaining_items({ count: filteredItems.length - displayedItems.length })})
				</Button>
			</div>
		{/if}
	{/if}
</div>