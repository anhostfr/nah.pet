<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { UserPlus } from 'lucide-svelte';
	import { goto, invalidate } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { tKey } from '$lib/i18n';
	import type { ActionData } from './$types';
	import type { NormalizedActionData } from '$lib/types';

	let { form }: { form: ActionData & NormalizedActionData } = $props();
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>{m.register_title()}</title>
</svelte:head>

<div class="min-h-full bg-primary-foreground flex items-center justify-center">
	<Card.Root class="max-w-md w-full">
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
				<UserPlus class="h-8 w-8 text-primary-foreground" />
			</div>
			<Card.Title>{m.register()}</Card.Title>
			<p class="text-sm text-muted-foreground">{m.create_account()}</p>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.redirectTo) {
							await invalidate('app:layout');
							goto(result.data.redirectTo as string);
						} else {
							await update();
						}
						isLoading = false;
					};
				}}
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="email">{m.email()}</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder={m.votre_email_placeholder()}
							bind:value={email}
							required
							autofocus
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">{m.password()}</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder={m.minimum_characters()}
							bind:value={password}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">{m.confirm_password()}</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder={m.repeat_password()}
							bind:value={confirmPassword}
							required
						/>
					</div>

					{#if form && form.success === false}
						<p class="text-sm text-destructive">{tKey(form.messageKey)}</p>
					{/if}

					<Button
						type="submit"
						disabled={isLoading || !email || !password || !confirmPassword}
						class="w-full"
					>
						{#if isLoading}
							{m.creating_account()}
						{:else}
							{m.create_my_account()}
						{/if}
					</Button>
				</div>
			</form>

			<div class="mt-6 text-center text-sm">
				<p class="text-muted-foreground">
					{m.already_have_account()}
					<a href="/login" class="text-primary hover:underline">{m.sign_in_link()}</a>
				</p>
			</div>

			<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />
			<div class="text-center text-sm text-gray-500 dark:text-gray-400">
				<p>{m.copyright_register({ year: new Date().getFullYear() })}</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
