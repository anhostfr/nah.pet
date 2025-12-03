import { redirect } from '@sveltejs/kit';
import { publicDoc } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (publicDoc) {
		return {};
	}

	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!locals.user.isAuthorized) {
		throw redirect(302, '/pending');
	}

	return {};
};
