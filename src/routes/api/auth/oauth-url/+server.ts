import { json } from '@sveltejs/kit';
import { getServerAuthClient } from '$lib/server/auth/oauth-instance.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const authClient = getServerAuthClient();
    
    const result = await authClient.signInWithOAuth();
    
    if (result.error) {
      return json({ error: result.error.message }, { status: 400 });
    }
    
    return json({ url: result.data?.url });
  } catch (err) {
    console.error('Erreur génération URL OAuth:', err);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};