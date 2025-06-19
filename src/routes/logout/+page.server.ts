import { redirect, type Actions } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth.js';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (!locals.session) {
			throw redirect(302, '/login');
		}

		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/login');
	}
};
