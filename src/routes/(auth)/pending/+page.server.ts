import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const user = await db.user.findUnique({
		where: { id: locals.user.id },
		include: {
			_count: {
				select: {
					links: true
				}
			}
		}
	});

	if (user?.isActive) {
		throw redirect(302, '/dashboard');
	}

	const waitingDays = user
		? Math.floor(
				(new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
			)
		: 0;

	return {
		user,
		waitingDays
	};
};
