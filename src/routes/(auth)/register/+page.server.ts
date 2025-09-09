import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { hash } from '@node-rs/argon2';
import { env } from '$env/dynamic/private';
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
		const confirmPassword = formData.get('confirmPassword');

		// TODO: Add specific traduction and error for each field later
		const schema = z.object({
			email: z.string().email(),
			password: z.string().min(8),
			confirmPassword: z.string()
		});

		const parseResult = schema.safeParse({ email, password, confirmPassword });
		if (!parseResult.success) {
			await sleep(2000);
			return actionFail(400, 'auth.invalid_data');
		}

		const {
			email: validEmail,
			password: validPassword,
			confirmPassword: validConfirmPassword
		} = parseResult.data;

		if (validPassword !== validConfirmPassword) {
			await sleep(2000);
			return actionFail(400, 'auth.passwords_do_not_match');
		}

		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const rateLimitKey = `register:${ip}:${validEmail}`;
		if (isRateLimited(rateLimitKey)) {
			await sleep(2000);
			return actionFail(429, 'common.too_many_attempts');
		}

		try {
			const existingUser = await db.user.findUnique({
				where: { email: validEmail.toLowerCase() }
			});

			if (existingUser) {
				await sleep(2000);
				return actionFail(400, 'auth.email_already_exists');
			}

			const hashedPassword = await hash(validPassword, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			const user = await db.user.create({
				data: {
					email: validEmail.toLowerCase(),
					password: hashedPassword,
					isAdmin: validEmail === env.ADMIN_EMAIL?.toLowerCase() || false,
					isActive: validEmail === env.ADMIN_EMAIL?.toLowerCase() || false
				}
			});

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return actionSuccess('auth.register_success', { redirectTo: '/dashboard' });
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			console.error("Erreur lors de l'inscription:", error);
			await sleep(2000);
			return actionFail(500, 'common.server_error');
		}
	}
};
