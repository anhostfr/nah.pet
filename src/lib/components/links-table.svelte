<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import { Copy, ExternalLink, BarChart3, Trash2, Lock, Calendar } from 'lucide-svelte';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	type Link = {
		id: string;
		slug: string;
		originalUrl: string;
		title?: string;
		password?: string;
		expiresAt?: Date;
		createdAt: Date;
		_count: {
			clicks: number;
		};
	};

	let { links }: { links: Link[] } = $props();

	async function copyToClipboard(slug: string) {
		try {
			await navigator.clipboard.writeText(`${$page.url.origin}/${slug}`);
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

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<BarChart3 class="h-5 w-5" />
			Mes liens ({formatNumber(links.length)})
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if links.length === 0}
			<div class="text-center py-8 text-muted-foreground">
				<p>Aucun lien créé pour le moment.</p>
				<p class="text-sm">Commencez par raccourcir votre première URL !</p>
			</div>
		{:else}
			<div class="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Lien</TableHead>
							<TableHead>URL originale</TableHead>
							<TableHead>Clics</TableHead>
							<TableHead>Créé le</TableHead>
							<TableHead>Status</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each links as link (link.id)}
							<TableRow>
								<TableCell>
									<div class="space-y-1">
										<div class="flex items-center gap-2">
											<code class="text-sm bg-muted px-2 py-1 rounded">
												/{link.slug}
											</code>
											{#if link.password}
												<Lock class="h-3 w-3 text-muted-foreground" />
											{/if}
											{#if link.expiresAt}
												<Calendar class="h-3 w-3 text-muted-foreground" />
											{/if}
										</div>
										{#if link.title}
											<p class="text-sm text-muted-foreground">{link.title}</p>
										{/if}
									</div>
								</TableCell>
								<TableCell>
									<a
										href={link.originalUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:underline max-w-xs truncate block"
									>
										{link.originalUrl}
									</a>
								</TableCell>
								<TableCell>
									<div class="flex items-center gap-2">
										<span class="font-medium">{formatNumber(link._count.clicks)}</span>
										<Button variant="ghost" size="sm" href="/stats/{link.slug}">
											<BarChart3 class="h-3 w-3" />
										</Button>
									</div>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground">
									{formatDate(new Date(link.createdAt))}
								</TableCell>
								<TableCell>
									{#if isExpired(link.expiresAt)}
										<Badge variant="destructive">Expiré</Badge>
									{:else if link.expiresAt}
										<Badge variant="secondary">
											Expire le {formatDate(new Date(link.expiresAt))}
										</Badge>
									{:else}
										<Badge variant="default">Actif</Badge>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-2">
										<Button variant="ghost" size="sm" onclick={() => copyToClipboard(link.slug)}>
											<Copy class="h-3 w-3" />
										</Button>
										<Button variant="ghost" size="sm" href="/{link.slug}" target="_blank">
											<ExternalLink class="h-3 w-3" />
										</Button>
										<form method="POST" action="?/delete" class="inline">
											<input type="hidden" name="linkId" value={link.id} />
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												class="text-destructive hover:text-destructive"
											>
												<Trash2 class="h-3 w-3" />
											</Button>
										</form>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		{/if}
	</CardContent>
</Card>
