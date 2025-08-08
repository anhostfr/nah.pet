import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';

export const Query = z.object({
	limit: z.coerce.number().min(1).max(100).optional().default(50),
	offset: z.coerce.number().min(0).optional().default(0),
	domain: z.string().optional(),
	search: z.string().optional().describe('Search in title and original URL'),
	sortBy: z
		.enum(['createdAt', 'clicks', 'title'])
		.optional()
		.default('createdAt')
		.describe('Sort by field'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order')
});

export const Output = z.object({
	links: z.array(
		z.object({
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
		})
	),
	pagination: z.object({
		total: z.number().describe('Total number of links'),
		limit: z.number().describe('Current limit'),
		offset: z.number().describe('Current offset'),
		hasMore: z.boolean().describe('Whether there are more links')
	})
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to fetch links')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'getLinks';
	r.summary = "List user's links";
	r.description = "Retrieve a paginated list of user's shortened links";
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
		const where: any = {
			userId: authResult.userId,
			...(input.domain && { customDomain: { domain: input.domain } })
		};

		if (input.search) {
			where.OR = [
				{ title: { contains: input.search, mode: 'insensitive' } },
				{ originalUrl: { contains: input.search, mode: 'insensitive' } },
				{ slug: { contains: input.search, mode: 'insensitive' } }
			];
		}

		const [links, total] = await Promise.all([
			db.link.findMany({
				where,
				include: {
					_count: { select: { clicks: true } },
					customDomain: { select: { domain: true } }
				},
				orderBy:
					input.sortBy === 'clicks'
						? {
								clicks: { _count: input.sortOrder }
							}
						: {
								[input.sortBy]: input.sortOrder
							},
				take: input.limit,
				skip: input.offset
			}),
			db.link.count({ where })
		]);

		return {
			links: links.map((link) => ({
				id: link.id,
				slug: link.slug,
				originalUrl: link.originalUrl,
				title: link.title,
				shortUrl: link.customDomain
					? `https://${link.customDomain.domain}/${link.slug}`
					: `https://nah.pet/${link.slug}`,
				clicks: link._count.clicks,
				domain: link.customDomain?.domain || null,
				expiresAt: link.expiresAt?.toISOString() || null,
				createdAt: link.createdAt.toISOString(),
				updatedAt: link.updatedAt.toISOString()
			})),
			pagination: {
				total,
				limit: input.limit,
				offset: input.offset,
				hasMore: input.offset + input.limit < total
			}
		};
	} catch (err) {
		console.error('Error fetching links:', err);
		throw Error[500];
	}
});
