import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';
import { generateUniqueSlug } from '$lib/server/slug-generator';
import { isValidUrl } from '$lib/utils';
import { sanitizeTitle, validateExpiresAt } from '$lib/utils/sanitize';
import { hash } from '@node-rs/argon2';
import { PUBLIC_MAIN_DOMAIN } from '$env/static/public';

export const Input = z.object({
	originalUrl: z.string().url().describe('The original URL to shorten'),
	slug: z.string().optional().describe('Custom slug (optional)'),
	title: z.string().max(255).optional().describe('Link title (optional)'),
	password: z.string().optional().describe('Password protection (optional)'),
	expiresAt: z
		.string()
		.refine((val) => !val || validateExpiresAt(val), {
			message: 'Expiration date must be in the future and within 10 years'
		})
		.optional()
		.describe('Expiration date (ISO string, optional)'),
	domain: z.string().optional().describe('Custom domain (optional)')
});

export const Output = z.object({
	id: z.string().describe('Link unique identifier'),
	slug: z.string().describe('Short URL slug'),
	originalUrl: z.string().describe('Original long URL'),
	title: z.string().nullable().describe('Link title'),
	shortUrl: z.string().describe('Complete short URL'),
	domain: z.string().nullable().describe('Custom domain if any'),
	expiresAt: z.string().nullable().describe('Expiration date'),
	createdAt: z.string().describe('Creation date')
});

export const Error = {
	400: error(400, 'Bad request - Invalid input'),
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to create link')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'createLink';
	r.summary = 'Create a new shortened link';
	r.description = 'Create a new shortened link with optional customization';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(async (input: any, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.LINKS_WRITE);

	try {
		const { originalUrl, slug, title, password, expiresAt, domain } = input as any;

		if (!isValidUrl(originalUrl)) {
			throw Error[400];
		}

		// Sanitize title
		const sanitizedTitle = title ? sanitizeTitle(title) : null;
		if (title && !sanitizedTitle) {
			throw Error[400];
		}

		let customDomain = null;
		if (domain) {
			customDomain = await db.customDomain.findFirst({
				where: {
					domain,
					userId: authResult.userId,
					verified: true
				}
			});

			if (!customDomain) {
				throw Error[400];
			}
		}

		const uniqueSlug = await generateUniqueSlug(slug, customDomain?.id);
		const hashedPassword = password
			? await hash(password, {
					memoryCost: 19456,
					timeCost: 2,
					outputLen: 32,
					parallelism: 1
				})
			: null;

		const link = await db.link.create({
			data: {
				originalUrl,
				slug: uniqueSlug,
				title: sanitizedTitle,
				password: hashedPassword,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				userId: authResult.userId,
				customDomainId: customDomain?.id || null
			}
		});

		const shortUrl = customDomain
			? `https://${customDomain.domain}/${link.slug}`
			: `https://${PUBLIC_MAIN_DOMAIN}/${link.slug}`;

		return {
			id: link.id,
			slug: link.slug,
			originalUrl: link.originalUrl,
			title: link.title,
			shortUrl,
			domain: customDomain?.domain || null,
			expiresAt: link.expiresAt?.toISOString() || null,
			createdAt: link.createdAt.toISOString()
		};
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Error creating link:', err);
		throw Error[500];
	}
});
