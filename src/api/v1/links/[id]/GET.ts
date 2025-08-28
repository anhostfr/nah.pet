import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';
import { PUBLIC_MAIN_DOMAIN } from '$env/static/public';

export const Query = z.object({
	id: z.string().describe('Link ID')
});

export const Output = z.object({
	id: z.string().describe('Link unique identifier'),
	slug: z.string().describe('Short URL slug'),
	originalUrl: z.string().describe('Original long URL'),
	title: z.string().nullable().describe('Link title'),
	shortUrl: z.string().describe('Complete short URL'),
	clicks: z.number().describe('Number of clicks'),
	domain: z.string().nullable().describe('Custom domain if any'),
	expiresAt: z.string().nullable().describe('Expiration date'),
	createdAt: z.string().describe('Creation date'),
	updatedAt: z.string().describe('Last update date')
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	404: error(404, 'Link not found'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to fetch link')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'getLink';
	r.summary = 'Get a specific link';
	r.description = 'Retrieve details of a specific shortened link';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Query, Output, Error, Modifier }).handle(async (input, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.LINKS_READ);

	try {
		const link = await db.link.findFirst({
			where: {
				id: input.id,
				userId: authResult.userId
			},
			include: {
				_count: { select: { clicks: true } },
				customDomain: { select: { domain: true } }
			}
		});

		if (!link) {
			throw Error[404];
		}

		return {
			id: link.id,
			slug: link.slug,
			originalUrl: link.originalUrl,
			title: link.title,
			shortUrl: link.customDomain
				? `https://${link.customDomain.domain}/${link.slug}`
				: `https://${PUBLIC_MAIN_DOMAIN}/${link.slug}`,
			clicks: link._count.clicks,
			domain: link.customDomain?.domain || null,
			expiresAt: link.expiresAt?.toISOString() || null,
			createdAt: link.createdAt.toISOString(),
			updatedAt: link.updatedAt.toISOString()
		};
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Error fetching link:', err);
		throw Error[500];
	}
});
