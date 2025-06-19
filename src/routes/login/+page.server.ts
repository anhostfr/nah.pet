import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { verify } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		if (!locals.user.isAuthorized) throw redirect(302, '/pending');
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email et mot de passe requis' });
		}

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { error: 'Données invalides' });
		}

		try {
			const user = await db.user.findUnique({
				where: { email: email.toLowerCase() }
			});

			if (!user || !user.password) {
				return fail(400, { error: 'Email ou mot de passe incorrect' });
			}

			const validPassword = await verify(user.password, password);

			if (!validPassword) {
				return fail(400, { error: 'Email ou mot de passe incorrect' });
			}

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true, redirectTo: '/' };
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			console.error('Erreur lors de la connexion:', error);
			return fail(500, { error: 'Erreur serveur' });
		}
	}
};
