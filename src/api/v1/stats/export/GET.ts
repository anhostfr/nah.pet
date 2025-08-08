import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';

export const Query = z.object({
	format: z.enum(['json', 'csv']).optional().default('json').describe('Export format'),
	days: z.coerce
		.number()
		.min(1)
		.max(365)
		.optional()
		.default(30)
		.describe('Number of days to export'),
	linkId: z.string().optional().describe('Specific link ID to export (optional)')
});

export const Output = z.object({
	data: z.string().describe('Exported data as string'),
	filename: z.string().describe('Suggested filename'),
	mimeType: z.string().describe('MIME type for download')
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to export stats')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Stats'];
	r.operationId = 'exportStats';
	r.summary = 'Export statistics';
	r.description = 'Export detailed statistics in JSON or CSV format';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Query, Output, Error, Modifier }).handle(async (input, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.STATS_READ);

	try {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - input.days);

		const whereClause: any = {
			userId: authResult.userId,
			createdAt: { gte: daysAgo }
		};

		if (input.linkId) {
			whereClause.id = input.linkId;
		}

		const links = await db.link.findMany({
			where: whereClause,
			include: {
				_count: { select: { clicks: true } },
				customDomain: { select: { domain: true } },
				clicks: {
					where: { createdAt: { gte: daysAgo } },
					select: {
						id: true,
						createdAt: true,
						country: true,
						city: true,
						userAgent: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		const exportData = links.map((link) => ({
			id: link.id,
			slug: link.slug,
			originalUrl: link.originalUrl,
			title: link.title,
			shortUrl: (link as any).customDomain
				? `https://${(link as any).customDomain.domain}/${link.slug}`
				: `https://nah.pet/${link.slug}`,
			domain: (link as any).customDomain?.domain || null,
			totalClicks: (link as any)._count.clicks,
			clicksInPeriod: (link as any).clicks.length,
			expiresAt: link.expiresAt?.toISOString() || null,
			createdAt: link.createdAt.toISOString(),
			updatedAt: link.updatedAt.toISOString(),
			clicks: (link as any).clicks.map((click: any) => ({
				id: click.id,
				createdAt: click.createdAt.toISOString(),
				country: click.country,
				city: click.city,
				userAgent: click.userAgent
			}))
		}));

		const timestamp = new Date().toISOString().split('T')[0];
		const filename = `stats-export-${timestamp}.${input.format}`;

		// CSV format
		if (input.format === 'csv') {
			const csvHeaders = [
				'Link ID',
				'Slug',
				'Original URL',
				'Title',
				'Short URL',
				'Domain',
				'Total Clicks',
				'Clicks in Period',
				'Expires At',
				'Created At',
				'Updated At'
			];

			const csvRows = exportData.map((link) => [
				link.id,
				link.slug,
				link.originalUrl,
				link.title || '',
				link.shortUrl,
				link.domain || '',
				link.totalClicks,
				link.clicksInPeriod,
				link.expiresAt || '',
				link.createdAt,
				link.updatedAt
			]);

			const csvContent = [csvHeaders, ...csvRows]
				.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}`).join(','))
				.join('\n');

			return {
				data: csvContent,
				filename,
				mimeType: 'text/csv'
			};
		}

		return {
			data: JSON.stringify(exportData, null, 2),
			filename,
			mimeType: 'application/json'
		};
	} catch (err) {
		console.error('Error exporting stats:', err);
		throw Error[500];
	}
});
