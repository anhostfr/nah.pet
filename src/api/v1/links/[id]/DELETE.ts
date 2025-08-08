import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';

export const Param = z.object({
	id: z.string().describe('Link ID')
});

export const Output = z.object({
	success: z.boolean().describe('Deletion success status'),
	message: z.string().describe('Success message')
});

export const Error = {
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	404: error(404, 'Link not found'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to delete link')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'deleteLink';
	r.summary = 'Delete a link';
	r.description = 'Delete an existing shortened link';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Param, Output, Error, Modifier }).handle(async (input, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.LINKS_WRITE);

	try {
		const link = await db.link.findFirst({
			where: {
				id: input.id,
				userId: authResult.userId
			}
		});

		if (!link) {
			throw Error[404];
		}

		await db.link.delete({
			where: { id: input.id }
		});

		return {
			success: true,
			message: 'Link deleted successfully'
		};
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Error deleting link:', err);
		throw Error[500];
	}
});
