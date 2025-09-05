import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';
import { env } from '$env/dynamic/public';

export const Param = z.object({
	slug: z.string().describe('Link slug')
});

export const Query = z.object({
	days: z.coerce
		.number()
		.min(1)
		.max(365)
		.optional()
		.default(30)
		.describe('Number of days to get stats for')
});

export const Output = z.object({
	link: z.object({
		id: z.string().describe('Link ID'),
		slug: z.string().describe('Link slug'),
		originalUrl: z.string().describe('Original URL'),
		title: z.string().nullable().describe('Link title'),
		shortUrl: z.string().describe('Short URL'),
		totalClicks: z.number().describe('Total clicks'),
		createdAt: z.string().describe('Creation date')
	}),
	stats: z.object({
		totalClicks: z.number().describe('Total clicks'),
		clicksInPeriod: z.number().describe('Clicks in specified period'),
		dailyStats: z
			.array(
				z.object({
					date: z.string().describe('Date'),
					clicks: z.number().describe('Clicks on that date')
				})
			)
			.describe('Daily click statistics'),
		topCountries: z
			.array(
				z.object({
					country: z.string().describe('Country name'),
					clicks: z.number().describe('Number of clicks')
				})
			)
			.describe('Top countries by clicks'),
		topCities: z
			.array(
				z.object({
					city: z.string().describe('City name'),
					clicks: z.number().describe('Number of clicks')
				})
			)
			.describe('Top cities by clicks')
	})
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	404: error(404, 'Link not found'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to fetch link stats')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Stats'];
	r.operationId = 'getLinkStats';
	r.summary = 'Get link statistics';
	r.description = 'Retrieve detailed statistics for a specific link';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Param, Query, Output, Error, Modifier }).handle(
	async (input, evt) => {
		const authResult = await apiAuth(evt);
		if (authResult instanceof Response) {
			throw Error[401];
		}

		requirePermission(authResult, API_PERMISSIONS.STATS_READ);

		try {
			const link = await db.link.findFirst({
				where: {
					slug: input.slug,
					userId: authResult.userId
				},
				include: {
					customDomain: { select: { domain: true } },
					_count: { select: { clicks: true } }
				}
			});

			if (!link) {
				throw Error[404];
			}

			const daysAgo = new Date();
			daysAgo.setDate(daysAgo.getDate() - input.days);

			const [clicksInPeriod, dailyClicks, topCountries, topCities] = await Promise.all([
				db.click.count({
					where: {
						linkId: link.id,
						createdAt: {
							gte: daysAgo
						}
					}
				}),
				db.click.groupBy({
					by: ['createdAt'],
					where: {
						linkId: link.id,
						createdAt: {
							gte: daysAgo
						}
					},
					_count: {
						id: true
					}
				}),
				db.click.groupBy({
					by: ['country'],
					where: {
						linkId: link.id,
						country: {
							not: null
						},
						createdAt: {
							gte: daysAgo
						}
					},
					_count: {
						id: true
					},
					orderBy: {
						_count: {
							id: 'desc'
						}
					},
					take: 10
				}),
				db.click.groupBy({
					by: ['city'],
					where: {
						linkId: link.id,
						city: {
							not: null
						},
						createdAt: {
							gte: daysAgo
						}
					},
					_count: {
						id: true
					},
					orderBy: {
						_count: {
							id: 'desc'
						}
					},
					take: 10
				})
			]);

			const dailyStatsMap = new Map<string, number>();
			for (let i = 0; i < input.days; i++) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateStr = date.toISOString().split('T')[0];
				dailyStatsMap.set(dateStr, 0);
			}

			dailyClicks.forEach((click) => {
				const dateStr = click.createdAt.toISOString().split('T')[0];
				dailyStatsMap.set(dateStr, (dailyStatsMap.get(dateStr) || 0) + click._count.id);
			});

			const dailyStats = Array.from(dailyStatsMap.entries())
				.map(([date, clicks]) => ({ date, clicks }))
				.sort((a, b) => a.date.localeCompare(b.date));

			return {
				link: {
					id: link.id,
					slug: link.slug,
					originalUrl: link.originalUrl,
					title: link.title,
					shortUrl: link.customDomain
						? `https://${link.customDomain.domain}/${link.slug}`
						: `https://${env.PUBLIC_MAIN_DOMAIN}/${link.slug}`,
					totalClicks: link._count.clicks,
					createdAt: link.createdAt.toISOString()
				},
				stats: {
					totalClicks: link._count.clicks,
					clicksInPeriod,
					dailyStats,
					topCountries: topCountries.map((c) => ({
						country: c.country || 'Unknown',
						clicks: c._count.id
					})),
					topCities: topCities.map((c) => ({
						city: c.city || 'Unknown',
						clicks: c._count.id
					}))
				}
			};
		} catch (err: any) {
			if (err.status) throw err;
			console.error('Error fetching link stats:', err);
			throw Error[500];
		}
	}
);
