import { createAuthClient } from './oauth.js';
import { authConfig } from './oauth-config.js';

let _serverAuthClient: ReturnType<typeof createAuthClient> | null = null;

export const getServerAuthClient = (redirectUri?: string) => {
  if (!_serverAuthClient) {
    _serverAuthClient = createAuthClient({
      ...authConfig,
      redirectUri: redirectUri || `https://nah.pet/api/oauth/callback`
    });
  }
  return _serverAuthClient;
};