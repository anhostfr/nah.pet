import { validateApiKey, hasPermission, type ApiKeyContext } from '$lib/server/api-auth.js';
import { isApiKeyRateLimited } from '$lib/server/rateLimit.js';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function apiAuth(event: RequestEvent): Promise<ApiKeyContext | Response> {
  const authHeader = event.request.headers.get('Authorization');
  console.log(event.request.headers);
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Bearer token required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (isApiKeyRateLimited(token)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const context = await validateApiKey(token);
  if (!context) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return context;
}

export function requirePermission(context: ApiKeyContext, permission: string): void {
  if (!hasPermission(context, permission)) {
    throw error(403, 'Insufficient permissions');
  }
}