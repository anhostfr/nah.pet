import api from '$api/v1';
import { json, error } from '@sveltejs/kit';
import { publicDoc } from '$lib/config';

export const prerender = false;

export const GET = async (evt) => {
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
