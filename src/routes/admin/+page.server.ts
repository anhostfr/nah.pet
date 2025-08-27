import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db.js';
import { ADMIN_EMAIL } from '$env/static/private';

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
			throw error(401, 'Non connecté');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			throw error(403, 'Accès non autorisé');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'ID utilisateur requis' });
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return fail(404, { error: 'Utilisateur introuvable' });
			}

			if (user.id === locals.user.id) {
				return fail(400, { error: 'Vous ne pouvez pas modifier votre propre statut' });
			}

			const newStatus = !user.isActive;

			await db.user.update({
				where: { id: userId },
				data: { isActive: newStatus }
			});

			return {
				success: true,
				message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`
			};
		} catch (err) {
			console.error('Erreur lors de la mise à jour:', err);
			return fail(500, { error: 'Erreur serveur' });
		}
	},

	toggleAdmin: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Non connecté');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			throw error(403, 'Accès non autorisé');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'ID utilisateur requis' });
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return fail(404, { error: 'Utilisateur introuvable' });
			}

			if (user.id === locals.user.id) {
				return fail(400, { error: 'Vous ne pouvez pas modifier vos propres droits admin' });
			}

			const newStatus = !user.isAdmin;

			await db.user.update({
				where: { id: userId },
				data: { isAdmin: newStatus }
			});

			return {
				success: true,
				message: `Droits admin ${newStatus ? 'accordés' : 'retirés'} avec succès`
			};
		} catch (err) {
			console.error('Erreur lors de la mise à jour:', err);
			return fail(500, { error: 'Erreur serveur' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Non connecté');
		}

		const currentUser = await db.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!currentUser?.isAdmin) {
			throw error(403, 'Accès non autorisé');
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'ID utilisateur requis' });
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return fail(404, { error: 'Utilisateur introuvable' });
			}

			if (user.id === locals.user.id) {
				return fail(400, { error: 'Vous ne pouvez pas supprimer votre propre compte' });
			}

			await db.user.delete({
				where: { id: userId }
			});

			return {
				success: true,
				message: 'Utilisateur supprimé avec succès'
			};
		} catch (err) {
			console.error('Erreur lors de la suppression:', err);
			return fail(500, { error: 'Erreur serveur' });
		}
	}
};
