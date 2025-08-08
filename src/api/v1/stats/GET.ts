import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';

export const Output = z.object({
	stats: z.object({
		totalLinks: z.number().describe('Total number of links'),
		totalClicks: z.number().describe('Total number of clicks'),
		clicksThisMonth: z.number().describe('Clicks this month'),
		linksThisMonth: z.number().describe('Links created this month'),
		activeLinks: z.number().describe('Number of active links'),
		expiredLinks: z.number().describe('Number of expired links')
	})
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to fetch stats')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Stats'];
	r.operationId = 'getStats';
	r.summary = 'Get user statistics';
	r.description = "Retrieve user's link statistics";
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Output, Error, Modifier }).handle(async (input, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.STATS_READ);

	try {
		const currentDate = new Date();
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

		const [links, totalClicks, clicksThisMonth, linksThisMonth] = await Promise.all([
			db.link.findMany({
				where: { userId: authResult.userId },
				select: { expiresAt: true }
			}),
			db.click.count({
				where: {
					link: {
						userId: authResult.userId
					}
				}
			}),
			db.click.count({
				where: {
					link: {
						userId: authResult.userId
					},
					createdAt: {
						gte: startOfMonth
					}
				}
			}),
			db.link.count({
				where: {
					userId: authResult.userId,
					createdAt: {
						gte: startOfMonth
					}
				}
			})
		]);

		const activeLinks = links.filter(
			(link) => !link.expiresAt || new Date() <= new Date(link.expiresAt)
		).length;

		const expiredLinks = links.length - activeLinks;

		return {
			stats: {
				totalLinks: links.length,
				totalClicks,
				clicksThisMonth,
				linksThisMonth,
				activeLinks,
				expiredLinks
			}
		};
	} catch (err: any) {
		console.error('Error fetching stats:', err);
		throw Error[500];
	}
});
