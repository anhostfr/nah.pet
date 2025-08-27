<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		Users,
		UserCheck,
		UserX,
		Shield,
		Trash2,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Link as LinkIcon,
		Eye
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { formatDate, formatNumber } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { SvelteComponent } from 'svelte';

	let { data } = $props();

	let isLoading = $state('');

	const formatRelativeTime = (date: Date) => {
		const now = new Date();
		const diffInDays = Math.floor(
			(now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
		);

		if (diffInDays === 0) return m.today();
		if (diffInDays === 1) return m.yesterday();
		if (diffInDays < 7) return m.days_ago({ days: diffInDays });
		if (diffInDays < 30) return m.weeks_ago({ weeks: Math.floor(diffInDays / 7) });
		return formatDate(date);
	};

	const getUserStatus = (user: any): { label: string; variant: BadgeVariant; icon: typeof SvelteComponent<any> } => {
		if (!user.isActive) {
			return { label: m.disabled_status(), variant: 'destructive', icon: XCircle };
		}
		if (user.isAdmin) {
			return { label: m.admin_status(), variant: 'default', icon: Shield };
		}
		return { label: m.active_status(), variant: 'secondary', icon: CheckCircle };
	};
</script>

<svelte:head>
	<title>{m.admin_title()}</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
				<Shield class="w-6 h-6 text-red-600" />
				<span>{m.administration()}</span>
			</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">{m.user_management_desc()}</p>
		</div>
		<Badge
			variant="outline"
			class="bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
		>
			<Shield class="w-3 h-3 mr-1" />
			{m.admin_zone()}
		</Badge>
	</div>

	<div class="grid gap-6 md:grid-cols-4">
		<Card.Root class="relative overflow-hidden">
			<Card.Content class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{m.total_users()}</p>
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
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{m.active_users()}</p>
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
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{m.total_links()}</p>
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
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">{m.administrators()}</p>
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
					<span>{m.user_management()}</span>
					<Badge variant="secondary">{data.users.length}</Badge>
				</span>
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-0">
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[250px]">{m.user_column()}</Table.Head>
							<Table.Head class="w-[120px] text-center">{m.status_column()}</Table.Head>
							<Table.Head class="w-[100px] text-center">{m.links_column()}</Table.Head>
							<Table.Head class="w-[100px] text-center">{m.clicks_column()}</Table.Head>
							<Table.Head class="w-[150px]">{m.registered_column()}</Table.Head>
							<Table.Head class="w-[250px] text-center">{m.actions_column()}</Table.Head>
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
														toast.success(result.data?.message as string || m.status_updated());
													} else {
														toast.error(m.update_error());
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
													{m.activate()}
												{:else}
													<UserX class="w-3 h-3 mr-1" />
													{m.deactivate()}
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
														toast.success(result.data?.message as string || m.admin_rights_updated());
													} else {
														toast.error(m.update_error());
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
													{m.remove_admin()}
												{:else}
													<Shield class="w-3 h-3 mr-1" />
													{m.make_admin()}
												{/if}
											</Button>
										</form>

										<form
											method="POST"
											action="?/deleteUser"
											use:enhance={() => {
												if (
													!confirm(
														m.delete_user_confirm({ email: user.email })
													)
												) {
													return () => {};
												}
												isLoading = `delete-${user.id}`;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success(m.user_deleted_success());
													} else {
														toast.error(m.delete_error());
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
						{m.admin_zone_warning()}
					</h3>
					<div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
						<p>{m.disable_user_info()}</p>
						<p>
							{m.delete_user_info()}
						</p>
						<p>{m.irreversible_actions()}</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
