import { env } from '$env/dynamic/private';

export const authConfig = {
  url: 'https://auth.anhost.fr',
  clientId: env.AUTH_CLIENT_ID!,
  clientSecret: env.AUTH_CLIENT_SECRET!,
  scopes: ['profile', 'email']
};