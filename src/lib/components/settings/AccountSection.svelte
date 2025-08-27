<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { User, Shield } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import * as m from "$lib/paraglide/messages";
	let { data, formatDate } = $props();
</script>

<div in:slide={{ duration: 200, delay: 400 }} out:slide={{ duration: 400, delay: 0 }} class="space-y-5">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center space-x-2">
				<User class="w-5 h-5" />
				<span>{m.account_info()}</span>
			</Card.Title>
			<Card.Description>{m.account_info_desc()}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>{m.email()}</Label>
					<Input value={data.user.email} readonly class="bg-muted" disabled />
					<p class="text-xs text-muted-foreground">{m.email_readonly()}</p>
				</div>
				<div class="space-y-2">
					<Label>Statut</Label>
					<div class="flex items-center space-x-2">
						<Badge variant={data.user.isActive ? 'default' : 'secondary'}>
							{data.user.isActive ? m.active() : m.inactive()}
						</Badge>
						{#if data.user.isAdmin}
							<Badge variant="destructive">{m.administrator()}</Badge>
						{/if}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center space-x-2">
				<Shield class="w-5 h-5" />
				<span>{m.security()}</span>
			</Card.Title>
			<Card.Description>{m.security_desc()}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label>{m.authentication()}</Label>
				<p class="text-sm text-muted-foreground">
					{m.oauth_password_info()}
				</p>
			</div>

			<div class="space-y-2">
				<Label>{m.active_sessions()}</Label>
				<p class="text-sm text-muted-foreground">
					{m.current_session({ date: formatDate(new Date().toISOString()) })}
				</p>
				<Button variant="outline" size="sm" disabled>
					{m.manage_sessions_soon()}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
