import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';

export const Input = z.object({
	ids: z.array(z.string()).min(1).max(100).describe('Array of link IDs to delete (max 100)')
});

export const Output = z.object({
	success: z.boolean().describe('Operation success'),
	deleted: z.array(z.string()).describe('Successfully deleted link IDs'),
	errors: z
		.array(
			z.object({
				id: z.string().describe('Link ID that failed to delete'),
				error: z.string().describe('Error message')
			})
		)
		.describe('Errors for failed deletions')
});

export const Error = {
	400: error(400, 'Bad request - Invalid input'),
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to delete links')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'deleteBulkLinks';
	r.summary = 'Delete multiple links';
	r.description = 'Delete multiple links in a single request';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(async (input: any, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.LINKS_WRITE);

	const ids = input.ids || [];

	const deleted = [];
	const errors = [];

	for (const id of ids) {
		try {
			const link = await db.link.findFirst({
				where: {
					id,
					userId: authResult.userId
				}
			});

			if (!link) {
				errors.push({ id, error: 'Link not found' });
				continue;
			}

			await db.link.delete({
				where: { id }
			});

			deleted.push(id);
		} catch (err) {
			console.error(`Error deleting link ${id}:`, err);
			errors.push({ id, error: 'Failed to delete link' });
		}
	}

	return {
		success: true,
		deleted,
		errors
	};
});
