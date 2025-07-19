<script lang="ts">
	import { MoveLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import SwaggerUI from 'swagger-ui';
	import 'swagger-ui/dist/swagger-ui.css';

	onMount(async () => {
		SwaggerUI({
			url: '/api/v1/openapi.json',
			dom_id: '#swagger-ui-container',
		});
	});
</script>

<svelte:head>
	<title>SwaggerUI</title>
</svelte:head>

<div>
	<div class="p-4 border-b">
		<a href="/settings" class="inline-flex items-center text-secondary-foreground transition-colors">
            <MoveLeft class="mr-2" />
			Retour
		</a>
	</div>
	<div id="swagger-ui-container" class="**:not-[span]:text-white! **:not-[pre]:not-[code]:not-[span]:bg-primary-foreground!"></div>
</div>
