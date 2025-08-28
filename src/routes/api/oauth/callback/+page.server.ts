import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getServerAuthClient } from '$lib/server/auth/oauth-instance.js';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { hash } from '@node-rs/argon2';
import { actionFail, actionSuccess } from '$lib/server/response.js';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		return actionFail(400, 'auth.oauth_missing_code_state');
	}

	try {
		const authClient = getServerAuthClient();

		const result = await authClient.exchangeCodeForSession(code, state);

		if (result.error) {
			return actionFail(400, 'auth.oauth_exchange_failed');
		}

		if (!result.data) {
			return actionFail(400, 'auth.oauth_user_fetch_failed');
		}

		const { user: oauthUser } = result.data;

		let user = await db.user.findUnique({
			where: {
				email: oauthUser.email
			}
		});

		if (!user) {
			const randomPassword = crypto.randomUUID() + crypto.randomUUID();
			const hashedPassword = await hash(randomPassword, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			user = await db.user.create({
				data: {
					email: oauthUser.email,
					isActive: false,
					isAdmin: false,
					password: hashedPassword
				}
			});
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return actionSuccess('auth.oauth_success', { redirectTo: user.isActive ? '/' : '/pending' });
	} catch (err) {
		if (err instanceof Response && err.status >= 300 && err.status < 400) {
			throw err;
		}
		console.error('Error callback OAuth:', err);
		return actionFail(500, 'common.server_error');
	}
};
