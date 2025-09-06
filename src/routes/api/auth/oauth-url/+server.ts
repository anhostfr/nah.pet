import { json } from '@sveltejs/kit';
import { getServerAuthClient } from '$lib/server/auth/oauth-instance.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const authClient = getServerAuthClient();

		const result = await authClient.signInWithOAuth();

		if (result.error) {
			return json({ success: false, messageKey: 'auth.oauth_url_failed' }, { status: 400 });
		}

		return json({ success: true, url: result.data?.url });
	} catch (err) {
		console.error('Error:', err);
		return json({ success: false, messageKey: 'common.server_error' }, { status: 500 });
	}
};
