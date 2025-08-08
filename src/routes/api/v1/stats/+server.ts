import api from '$api/v1';
import type { RequestHandler } from './$types';

export const GET = ((evt) => api.handle(evt)) satisfies RequestHandler;
