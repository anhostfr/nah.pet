<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { tKey } from '$lib/i18n';

	let { data }: { data: { success?: boolean; redirectTo?: string; messageKey?: string } } =
		$props();
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (data?.success && data?.redirectTo) {
			invalidate('app:auth').then(() => {
				goto(data.redirectTo as string);
			});
		} else if (data && data.success === false && data.messageKey) {
			error = tKey(data.messageKey, data);
			loading = false;
		} else {
			setTimeout(() => {
				loading = false;
			}, 3000);
		}
	});
</script>

<div class="fixed inset-0 flex items-center justify-center min-h-screen">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			{#if loading}
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
				<h2 class="mt-6 text-xl font-medium">{m.connecting()}</h2>
				<p class="mt-2 text-sm">{m.wait_connection()}</p>
			{:else if error}
				<div>
					<h2 class="text-xl font-medium">{m.error_connection()}</h2>
					<p class="my-1 text-sm">{error}</p>
					<Button onclick={() => goto('/login')} class="">{m.back_to_login()}</Button>
				</div>
			{:else}
				<div>
					<h2 class="text-xl font-medium">{m.connection_success()}</h2>
					<p class="my-1 text-sm text-secondary">{m.redirecting()}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
