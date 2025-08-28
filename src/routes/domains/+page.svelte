<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Trash2, ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { isMobile } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
	import { tKey } from '$lib/i18n';
	import type { NormalizedActionData } from '$lib/types';

	const SYSTEM_RESERVED_SLUGS = [
		'admin',
		'api',
		'app',
		'auth',
		'blog',
		'cdn',
		'dashboard',
		'dev',
		'docs',
		'ftp',
		'help',
		'login',
		'logout',
		'mail',
		'news',
		'register',
		'root',
		'shop',
		'ssl',
		'staging',
		'stats',
		'support',
		'test',
		'www',
		'domains',
		'pending',
		'settings',
		'profile',
		'account'
	];

	let { data, form }: { data: PageData; form: NormalizedActionData } = $props();

	let isAdding = $state(false);
	let isVerifying = $state(false);
	let isDeleting = $state(false);
	let selectedMethod: 'dns' | 'file' = $state('dns');

	$effect(() => {
		if (form?.success) {
			toast.success(tKey(form.messageKey, form));
			invalidateAll();
		} else if (form && form.success === false) {
			toast.error(tKey(form.messageKey, form));
		}
	});

	function getStatusBadge(verified: boolean) {
		if (verified) {
			return { variant: 'default' as const, icon: CheckCircle, text: m.verified() };
		} else {
			return { variant: 'secondary' as const, icon: Clock, text: m.pending() };
		}
	}

	function getVerificationInstructions(domain: string, token: string, method: 'dns' | 'file') {
		if (method === 'dns') {
			return {
				title: m.dns_verification() + ' (' + m.dns_recommended() + ')',
				steps: [
					m.connect_dns_provider(),
					m.add_txt_record(),
					m.txt_type(),
					m.txt_name({ domain }),
					m.txt_value({ token }),
					m.wait_dns_propagation()
				]
			};
		} else {
			return {
				title: m.file_verification(),
				steps: [m.create_wellknown_file(), m.file_content({ token }), m.make_accessible({ domain })]
			};
		}
	}
</script>

<svelte:head>
	<title>{m.custom_domains_title()}</title>
</svelte:head>

<div class="container mx-auto py-8 px-4">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">{m.custom_domains()}</h1>
		<p class="text-muted-foreground">
			{m.custom_domains_desc()}
		</p>
	</div>

	<Card.Root class="mb-8 bg-gradient-to-br from-red-900/20 to-red-800/20 dark:border-red-800">
		<Card.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-red-600" />
				<Card.Title class="text-red-600">{m.domain_isolation_title()}</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-red-600">
			<p class="mb-2">
				{@html m.total_isolation()}
			</p>
			<ul class="list-disc list-inside space-y-1 text-sm">
				<li>{m.custom_domain_access()}</li>
				<li>{m.no_main_domain_access()}</li>
				<li>{m.no_system_pages_access()}</li>
				<li>
					{m.forbidden_slugs({ slugs: SYSTEM_RESERVED_SLUGS.slice(0, 8).join(', ') })}
				</li>
			</ul>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-8 bg-gradient-to-br from-blue-900/20 to-blue-800/20 dark:border-blue-800">
		<Card.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-blue-600" />
				<Card.Title class="text-blue-600">{m.dns_config_required()}</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-blue-600">
			<p class="mb-3">
				{@html m.after_verification_config()}
			</p>
			<div class="bg-blue-900/20 p-3 rounded-lg mb-3">
				<p class="font-mono text-sm">
					{m.cname_record_info()}<br />
				</p>
			</div>
			<p class="text-sm">
				{m.redirect_info()}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>{m.add_new_domain_title()}</Card.Title>
			<Card.Description>
				{m.add_domain_description()}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/addDomain"
				use:enhance={() => {
					isAdding = true;
					return async ({ update }) => {
						await update();
						isAdding = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<Label for="domain">{m.domain_column()}</Label>
					<Input
						id="domain"
						name="domain"
						type="text"
						placeholder={m.domain_placeholder()}
						required
						class="mt-1"
					/>
					<p class="text-sm text-muted-foreground mt-1">
						{m.domain_format()}
					</p>
				</div>

				<div>
					<Label>{m.verification_method()}</Label>
					<div class="flex gap-4 mt-2">
						<label class="flex items-center gap-2">
							<input type="radio" name="method" value="dns" bind:group={selectedMethod} required />
							{m.dns_recommended()}
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" name="method" value="file" bind:group={selectedMethod} required />
							{m.file_method()}
						</label>
					</div>
				</div>

				<Button type="submit" disabled={isAdding}>
					{isAdding ? m.adding_progress() : m.add_domain()}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<div class="space-y-4">
		{#each data.customDomains as domain}
			{@const status = getStatusBadge(domain.verified)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Card.Title class="text-xl">{domain.domain}</Card.Title>
							<Badge variant={status.variant} class="flex items-center gap-1">
								<status.icon class="h-3 w-3" />
								{status.text}
							</Badge>
						</div>
						<div class="flex items-center gap-2">
							{#if domain.verified}
								<Button
									variant="outline"
									size="sm"
									onclick={() => window.open(`https://${domain.domain}`, '_blank')}
								>
									<ExternalLink class="h-4 w-4 md:mr-1" />{isMobile() ? '' : m.visit()}
								</Button>
							{/if}
							<form
								method="POST"
								action="?/deleteDomain"
								use:enhance={() => {
									isDeleting = true;
									return async ({ update }) => {
										await update();
										isDeleting = false;
									};
								}}
							>
								<input type="hidden" name="domainId" value={domain.id} />
								<Button
									type="submit"
									variant="destructive"
									size="sm"
									disabled={isDeleting}
									title={domain._count.links > 0
										? m.delete_domain_confirm({ count: domain._count.links })
										: 'Supprimer le domaine'}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>
					<Card.Description>
						{m.created_on_date({ date: new Date(domain.createdAt).toLocaleDateString('fr-FR') })} •
						{domain._count.links} lien{domain._count.links !== 1 ? 's' : ''}
					</Card.Description>
				</Card.Header>

				{#if !domain.verified}
					<Card.Content>
						{@const instructions = getVerificationInstructions(
							domain.domain,
							domain.verificationToken,
							domain.verificationMethod as 'dns' | 'file'
						)}

						<div class="mb-4 p-4 bg-muted rounded-lg">
							<h4 class="font-semibold mb-2">{instructions.title}</h4>
							<ol class="list-decimal list-inside space-y-1 text-sm">
								{#each instructions.steps as step}
									<li>{step}</li>
								{/each}
							</ol>
						</div>

						<form
							method="POST"
							action="?/verifyDomain"
							use:enhance={() => {
								isVerifying = true;
								return async ({ update }) => {
									await update();
									isVerifying = false;
								};
							}}
						>
							<input type="hidden" name="domainId" value={domain.id} />
							<Button type="submit" disabled={isVerifying}>
								{isVerifying ? m.verification_progress() : m.verify_domain_button()}
							</Button>
						</form>
					</Card.Content>
				{/if}
			</Card.Root>
		{/each}

		{#if data.customDomains.length === 0}
			<Card.Root>
				<Card.Content class="text-center py-8">
					<p class="text-muted-foreground">{m.no_custom_domains_message()}</p>
					<p class="text-sm text-muted-foreground mt-1">
						{m.add_first_domain()}
					</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>
