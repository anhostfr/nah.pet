import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const publicDoc = env.PUBLIC_DOC === 'true';

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
