<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		Users,
		UserCheck,
		UserX,
		Shield,
		Trash2,
		BarChart3,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Activity,
		Link as LinkIcon,
		Eye
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatDate, formatNumber } from '$lib/utils.js';

	let { data, form } = $props();

	let isLoading = $state('');

	const formatRelativeTime = (date: Date) => {
		const now = new Date();
		const diffInDays = Math.floor(
			(now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
		);

		if (diffInDays === 0) return "Aujourd'hui";
		if (diffInDays === 1) return 'Hier';
		if (diffInDays < 7) return `Il y a ${diffInDays}j`;
		if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} sem.`;
		return formatDate(date);
	};

	const getUserStatus = (user: any) => {
		if (!user.isActive) {
			return { label: 'Désactivé', variant: 'destructive', icon: XCircle };
		}
		if (user.isAdmin) {
			return { label: 'Admin', variant: 'default', icon: Shield };
		}
		return { label: 'Actif', variant: 'secondary', icon: CheckCircle };
	};
</script>

<svelte:head>
	<title>Administration - Nah.pet</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
				<Shield class="w-6 h-6 text-red-600" />
				<span>Administration</span>
			</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">Gestion des utilisateurs et autorisations</p>
		</div>
		<Badge
			variant="outline"
			class="bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
		>
			<Shield class="w-3 h-3 mr-1" />
			Zone Admin
		</Badge>
	</div>

	<div class="grid gap-6 md:grid-cols-4">
		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total utilisateurs</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.totalUsers)}
						</p>
					</div>
					<div
						class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
					>
						<Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
				</div>
			</Card.Content>
			<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.activeUsers)}
						</p>
					</div>
					<div
						class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
					>
						<UserCheck class="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
				</div>
			</Card.Content>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-600 to-green-400"
			></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total liens</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.totalLinks)}
						</p>
					</div>
					<div
						class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
					>
						<LinkIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</Card.Content>
			<div
				class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400"
			></div>
		</Card.Root>

		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Administrateurs</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">
							{formatNumber(data.stats.adminUsers)}
						</p>
					</div>
					<div
						class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"
					>
						<Shield class="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
				</div>
			</Card.Content>
			<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header class="border-b border-gray-100 dark:border-gray-700">
			<Card.Title class="flex items-center justify-between">
				<span class="flex items-center space-x-2">
					<Users class="w-5 h-5" />
					<span>Gestion des utilisateurs</span>
					<Badge variant="secondary">{data.users.length}</Badge>
				</span>
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-0">
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[250px]">Utilisateur</Table.Head>
							<Table.Head class="w-[120px] text-center">Statut</Table.Head>
							<Table.Head class="w-[100px] text-center">Liens</Table.Head>
							<Table.Head class="w-[100px] text-center">Clics</Table.Head>
							<Table.Head class="w-[150px]">Inscrit le</Table.Head>
							<Table.Head class="w-[250px] text-center">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.users as user (user.id)}
							{@const status = getUserStatus(user)}
							<Table.Row class="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
								<Table.Cell>
									<div class="space-y-1">
										<p class="font-medium text-gray-900 dark:text-white">
											{user.email}
										</p>
										<p class="text-xs text-gray-500 font-mono">
											{user.id}
										</p>
									</div>
								</Table.Cell>

								<Table.Cell class="text-center">
									<Badge variant={status.variant} class="text-xs">
										<status.icon class="w-3 h-3 mr-1" />
										{status.label}
									</Badge>
								</Table.Cell>

								<Table.Cell class="text-center">
									<div class="flex items-center justify-center space-x-1">
										<LinkIcon class="w-4 h-4 text-gray-400" />
										<span class="font-medium">{formatNumber(user._count.links)}</span>
									</div>
								</Table.Cell>

								<Table.Cell class="text-center">
									<div class="flex items-center justify-center space-x-1">
										<Eye class="w-4 h-4 text-gray-400" />
										<span class="font-medium">{formatNumber(user.totalClicks)}</span>
									</div>
								</Table.Cell>

								<Table.Cell>
									<div class="space-y-1">
										<p class="text-sm text-gray-900 dark:text-white">
											{formatDate(user.createdAt)}
										</p>
										<p class="text-xs text-gray-500">
											{formatRelativeTime(user.createdAt)}
										</p>
									</div>
								</Table.Cell>

								<Table.Cell>
									<div class="flex items-center justify-center space-x-2">
										<form
											method="POST"
											action="?/toggleActivation"
											use:enhance={() => {
												isLoading = user.id;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success(result.data?.message || 'Statut mis à jour');
													} else {
														toast.error('Erreur lors de la mise à jour');
													}
													await update();
													isLoading = '';
												};
											}}
										>
											<input type="hidden" name="userId" value={user.id} />
											<Button
												type="submit"
												size="sm"
												variant={!user.isActive ? 'default' : 'secondary'}
												disabled={isLoading === user.id || user.id === data.currentUserId}
												class="h-8 text-xs"
											>
												{#if isLoading === user.id}
													<div
														class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"
													></div>
												{:else if !user.isActive}
													<UserCheck class="w-3 h-3 mr-1" />
													Activer
												{:else}
													<UserX class="w-3 h-3 mr-1" />
													Désactiver
												{/if}
											</Button>
										</form>

										<form
											method="POST"
											action="?/toggleAdmin"
											use:enhance={() => {
												isLoading = `admin-${user.id}`;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success(result.data?.message || 'Droits admin mis à jour');
													} else {
														toast.error('Erreur lors de la mise à jour');
													}
													await update();
													isLoading = '';
												};
											}}
										>
											<input type="hidden" name="userId" value={user.id} />
											<Button
												type="submit"
												size="sm"
												variant={user.isAdmin ? 'destructive' : 'outline'}
												disabled={isLoading === `admin-${user.id}` ||
													user.id === data.currentUserId}
												class="h-8 text-xs"
											>
												{#if isLoading === `admin-${user.id}`}
													<div
														class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"
													></div>
												{:else if user.isAdmin}
													<UserX class="w-3 h-3 mr-1" />
													Retirer admin
												{:else}
													<Shield class="w-3 h-3 mr-1" />
													Rendre admin
												{/if}
											</Button>
										</form>

										<form
											method="POST"
											action="?/deleteUser"
											use:enhance={() => {
												if (
													!confirm(
														`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?\n\nCette action est irréversible et supprimera tous ses liens et données.`
													)
												) {
													return () => {};
												}
												isLoading = `delete-${user.id}`;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success('Utilisateur supprimé avec succès');
													} else {
														toast.error('Erreur lors de la suppression');
													}
													await update();
													isLoading = '';
												};
											}}
										>
											<input type="hidden" name="userId" value={user.id} />
											<Button
												type="submit"
												size="sm"
												variant="destructive"
												disabled={isLoading === `delete-${user.id}` ||
													user.id === data.currentUserId}
												class="h-8 w-8 p-0 text-destructive-foreground"
											>
												{#if isLoading === `delete-${user.id}`}
													<div
														class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
													></div>
												{:else}
													<Trash2 class="w-3 h-3" />
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
		</Card.Content>
	</Card.Root>

	<Card.Root class="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
		<Card.Content class="p-6">
			<div class="flex items-start space-x-3">
				<AlertTriangle class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
				<div>
					<h3 class="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
						⚠️ Zone d'administration
					</h3>
					<div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
						<p>• <strong>Désactiver</strong> un utilisateur l'empêche de se connecter</p>
						<p>
							• <strong>Supprimer</strong> un utilisateur efface définitivement toutes ses données
						</p>
						<p>• Ces actions sont <strong>irréversibles</strong> - soyez prudent</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
