import api from '$api/v1';
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

export const prerender = false;

export const GET = async (evt) => {
	const publicDoc = env.PUBLIC_DOC === 'true';

	if (!publicDoc) {
		if (!evt.locals.user?.isAuthorized) {
			throw error(401, 'Unauthorized');
		}
	}

	const openapi = await api.openapi(evt);
	return json(openapi, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
