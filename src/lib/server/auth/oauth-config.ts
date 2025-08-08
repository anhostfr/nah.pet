import { env } from '$env/dynamic/private';

export const authConfig = {
	url: 'https://auth.anhost.fr',
	clientId: env.OAUTH_CLIENT_ID!,
	clientSecret: env.OAUTH_CLIENT_SECRET!,
	scopes: ['profile', 'email']
};
