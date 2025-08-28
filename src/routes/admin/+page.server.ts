import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db.js';
import { ADMIN_EMAIL } from '$env/static/private';
import { actionFail, actionSuccess } from '$lib/server/response.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const currentUser = await db.user.findUnique({
		where: { id: locals.user.id }
	});

	if (!currentUser?.isAdmin) {
		throw redirect(403, '/');
	}

	const users = await db.user.findMany({
		include: {
			_count: {
				select: {
					links: true,
					sessions: true,
				}
			}
		},
		where: {
			email: {
				not: ADMIN_EMAIL
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	const usersWithStats = await Promise.all(
		users.map(async (user) => {
			const totalClicks = await db.click.count({
				where: {
					link: {
						userId: user.id
					}
				}

			});

			return {
				...user,
				totalClicks
			};
		})
	);

	const stats = {
		totalUsers: users.length,
		activeUsers: users.filter((u) => u.isActive).length,
		inactiveUsers: users.filter((u) => !u.isActive).length,
		adminUsers: users.filter((u) => u.isAdmin).length,
		totalLinks: await db.link.count(),
		totalClicks: await db.click.count()
	};

	return {
		users: usersWithStats,
		stats,
		currentUserId: locals.user.id
	};
};

export const actions: Actions = {
	toggleActivation: async ({ request, locals }) => {
		if (!locals.user) {
			return actionFail(401, 'auth.not_logged_in');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			return actionFail(403, 'auth.not_authorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return actionFail(400, 'admin.user_id_required');
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return actionFail(404, 'admin.user_not_found');
			}

			if (user.id === locals.user.id) {
				return actionFail(400, 'admin.cannot_toggle_self_status');
			}

			const newStatus = !user.isActive;

			await db.user.update({
				where: { id: userId },
				data: { isActive: newStatus }
			});

			return actionSuccess(newStatus ? 'admin.user_activated' : 'admin.user_deactivated', { userId });
		} catch (err) {
			console.error('Erreur lors de la mise à jour:', err);
			return actionFail(500, 'common.server_error');
		}
	},

	toggleAdmin: async ({ request, locals }) => {
		if (!locals.user) {
			return actionFail(401, 'auth.not_logged_in');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			return actionFail(403, 'auth.not_authorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return actionFail(400, 'admin.user_id_required');
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return actionFail(404, 'admin.user_not_found');
			}

			if (user.id === locals.user.id) {
				return actionFail(400, 'admin.cannot_change_own_admin_rights');
			}

			const newStatus = !user.isAdmin;

			await db.user.update({
				where: { id: userId },
				data: { isAdmin: newStatus }
			});

			return actionSuccess(newStatus ? 'admin.admin_rights_granted' : 'admin.admin_rights_revoked', { userId });
		} catch (err) {
			console.error('Erreur lors de la mise à jour:', err);
			return actionFail(500, 'common.server_error');
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user) {
			return actionFail(401, 'auth.not_logged_in');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			return actionFail(403, 'auth.not_authorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return actionFail(400, 'admin.user_id_required');
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return actionFail(404, 'admin.user_not_found');
			}

			if (user.id === locals.user.id) {
				return actionFail(400, 'admin.cannot_delete_self');
			}

			await db.user.delete({
				where: { id: userId }
			});

			return actionSuccess('admin.user_deleted', { userId });
		} catch (err) {
			console.error('Erreur lors de la suppression:', err);
			return actionFail(500, 'common.server_error');
		}
	}
};
