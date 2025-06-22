import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { verify } from '@node-rs/argon2';
import { isRateLimited } from '$lib/server/rateLimit';
import { z } from 'zod';
import { sleep } from '$lib/utils';

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
		const email = formData.get('email');
		const password = formData.get('password');

		const schema = z.object({
			email: z.string().email({ message: 'Email invalide' }),
			password: z.string().min(1, { message: 'Mot de passe requis' })
		});

		const parseResult = schema.safeParse({ email, password });
		if (!parseResult.success) {
			await sleep(2000);
			return fail(400, { error: parseResult.error.errors[0]?.message || 'Données invalides' });
		}

		const { email: validEmail, password: validPasswordInput } = parseResult.data;

		const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const rateLimitKey = `login:${ip}:${validEmail}`;
		if (isRateLimited(rateLimitKey)) {
			await sleep(2000);
			return fail(429, { error: 'Trop de tentatives, réessayez plus tard.' });
		}

		try {
			const user = await db.user.findUnique({
				where: { email: validEmail.toLowerCase() }
			});

			if (!user || !user.password) {
				await sleep(2000);
				return fail(400, { error: 'Email ou mot de passe incorrect' });
			}

			const validPassword = await verify(user.password, validPasswordInput);

			if (!validPassword) {
				await sleep(2000);
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
			await sleep(2000);
			return fail(500, { error: 'Erreur serveur' });
		}
	}
};
