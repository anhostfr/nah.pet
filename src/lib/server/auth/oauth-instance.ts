import { createAuthClient } from './oauth.js';
import { authConfig } from './oauth-config.js';
import { env } from '$env/dynamic/public';

let _serverAuthClient: ReturnType<typeof createAuthClient> | null = null;

export const getServerAuthClient = (redirectUri?: string) => {
	if (!_serverAuthClient) {
		_serverAuthClient = createAuthClient({
			...authConfig,
			redirectUri: redirectUri || `https://${env.PUBLIC_MAIN_DOMAIN}/api/oauth/callback`
		});
	}
	return _serverAuthClient;
};
