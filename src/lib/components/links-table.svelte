<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Copy, ExternalLink, BarChart3, Trash2, Lock, Calendar } from 'lucide-svelte';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	type Link = {
		id: string;
		slug: string;
		originalUrl: string;
		title?: string | null;
		password?: string;
		expiresAt?: Date;
		createdAt: Date;
		_count: {
			clicks: number;
		};
		customDomain?: {
			id: string;
			domain: string;
		} | null;
	};

	let { links }: { links: Link[] } = $props();
	let deletingLinkId = $state<string | null>(null);

	async function copyToClipboard(link: Link) {
		try {
			const url = link.customDomain 
				? `https://${link.customDomain.domain}/${link.slug}`
				: `${$page.url.origin}/${link.slug}`;
			await navigator.clipboard.writeText(url);
			toast.success('Lien copié !');
		} catch (err) {
			toast.error('Impossible de copier le lien');
		}
	}

	function isExpired(expiresAt?: Date): boolean {
		if (!expiresAt) return false;
		return new Date() > new Date(expiresAt);
	}
</script>

{#if links.length === 0}
	<div class="text-center py-8 text-muted-foreground">
		<p>Aucun lien créé pour le moment.</p>
		<p class="text-sm">Commencez par raccourcir votre première URL !</p>
	</div>
{:else}
	<div class="rounded-md border mx-2 overflow-x-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Lien</Table.Head>
					<Table.Head class="hidden sm:table-cell">URL originale</Table.Head>
					<Table.Head>Clics</Table.Head>
					<Table.Head class="hidden md:table-cell">Créé le</Table.Head>
					<Table.Head class="hidden lg:table-cell">Status</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each links as link (link.id)}
					<Table.Row>
						<Table.Cell>
							<div class="space-y-1">
								<div class="flex items-center gap-2 flex-wrap">
									<code class="text-sm bg-muted px-2 py-1 rounded break-all">
										{link.customDomain ? `${link.customDomain.domain}/` : '/'}{link.slug}
									</code>
									{#if link.password}
										<Lock class="h-3 w-3 text-muted-foreground" />
									{/if}
									{#if link.expiresAt}
										<Calendar class="h-3 w-3 text-muted-foreground" />
									{/if}
								</div>
								{#if link.title}
									<p class="text-sm text-muted-foreground truncate">{link.title}</p>
								{/if}
								<div class="sm:hidden space-y-1 mt-2">
									<a
										href={link.originalUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:underline text-xs truncate block"
									>
										{link.originalUrl}
									</a>
									<div class="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{formatDate(new Date(link.createdAt))}</span>
										{#if isExpired(link.expiresAt)}
											<span class="text-red-600">• Expiré</span>
										{:else if link.expiresAt}
											<span>• Expire le {formatDate(new Date(link.expiresAt))}</span>
										{:else}
											<span class="text-green-600">• Actif</span>
										{/if}
									</div>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="hidden sm:table-cell">
							<a
								href={link.originalUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 hover:underline max-w-xs truncate block"
							>
								{link.originalUrl}
							</a>
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span class="font-medium">{formatNumber(link._count.clicks)}</span>
								<Button variant="ghost" size="sm" href="/stats/{link.slug}">
									<BarChart3 class="h-3 w-3" />
								</Button>
							</div>
						</Table.Cell>
						<Table.Cell class="text-sm text-muted-foreground hidden md:table-cell">
							{formatDate(new Date(link.createdAt))}
						</Table.Cell>
						<Table.Cell class="hidden lg:table-cell">
							{#if isExpired(link.expiresAt)}
								<Badge variant="destructive">Expiré</Badge>
							{:else if link.expiresAt}
								<Badge variant="secondary">
									Expire le {formatDate(new Date(link.expiresAt))}
								</Badge>
							{:else}
								<Badge variant="default">Actif</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="sm" onclick={() => copyToClipboard(link)}>
									<Copy class="h-3 w-3" />
								</Button>
								<Button variant="ghost" size="sm" href={link.customDomain ? `https://${link.customDomain.domain}/${link.slug}` : `/${link.slug}`} target="_blank">
									<ExternalLink class="h-3 w-3" />
								</Button>
								<Button variant="ghost" size="sm" href="/stats/{link.slug}" class="hidden sm:inline-flex">
									<BarChart3 class="h-3 w-3" />
								</Button>
								<form 
									method="POST" 
									action="?/delete" 
									class="inline"
									use:enhance={() => {
										if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.')) {
											return () => {};
										}
										deletingLinkId = link.id;
										return async ({ result, update }) => {
											if (result.type === 'success') {
												toast.success('Lien supprimé avec succès');
											} else {
												toast.error('Erreur lors de la suppression du lien');
											}
											await update();
											deletingLinkId = null;
										};
									}}
								>
									<input type="hidden" name="linkId" value={link.id} />
									<Button
										type="submit"
										variant="ghost"
										size="sm"
										disabled={deletingLinkId === link.id}
										class="text-destructive hover:text-destructive"
									>
										{#if deletingLinkId === link.id}
											<div class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
										{:else}
											<Trash2 class="h-3 w-3" />
										{/if}
									</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
