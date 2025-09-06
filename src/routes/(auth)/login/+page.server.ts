import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { verify } from '@node-rs/argon2';
import { isRateLimited } from '$lib/server/rateLimit';
import { z } from 'zod';
import { sleep } from '$lib/utils';
import { actionFail, actionSuccess } from '$lib/server/response.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		if (!locals.user.isAuthorized) throw redirect(302, '/pending');
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		// TODO: Add specific traduction and error for each field later
		const schema = z.object({
			email: z.string().email(),
			password: z.string().min(1)
		});

		const parseResult = schema.safeParse({ email, password });
		if (!parseResult.success) {
			await sleep(2000);
			return actionFail(400, 'auth.invalid_data');
		}

		const { email: validEmail, password: validPasswordInput } = parseResult.data;

		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const rateLimitKey = `login:${ip}:${validEmail}`;
		if (isRateLimited(rateLimitKey)) {
			await sleep(2000);
			return actionFail(429, 'common.too_many_attempts');
		}

		try {
			const user = await db.user.findUnique({
				where: { email: validEmail.toLowerCase() }
			});

			if (!user || !user.password) {
				await sleep(2000);
				return actionFail(400, 'auth.invalid_credentials');
			}

			const validPassword = await verify(user.password, validPasswordInput);

			if (!validPassword) {
				await sleep(2000);
				return actionFail(400, 'auth.invalid_credentials');
			}

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return actionSuccess('auth.login_success', { redirectTo: '/dashboard' });
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			console.error('Erreur lors de la connexion:', error);
			await sleep(2000);
			return actionFail(500, 'common.server_error');
		}
	}
};
