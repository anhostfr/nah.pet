import { Endpoint, z, error, type RouteConfig } from 'sveltekit-api';
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';
import { generateUniqueSlug } from '$lib/server/slug-generator';
import { isValidUrl } from '$lib/utils';
import { sanitizeTitle } from '$lib/utils/sanitize';
import { hash } from '@node-rs/argon2';

export const Input = z.object({
	links: z
		.array(
			z.object({
				originalUrl: z.string().url(),
				slug: z.string().optional(),
				title: z.string().optional(),
				password: z.string().optional(),
				expiresAt: z.string().optional(),
				domain: z.string().optional()
			})
		)
		.min(1)
		.max(100)
});

export const Output = z.object({
	success: z.boolean().describe('Operation success'),
	created: z
		.array(
			z.object({
				id: z.string().describe('Link unique identifier'),
				slug: z.string().describe('Short URL slug'),
				originalUrl: z.string().describe('Original long URL'),
				title: z.string().nullable().describe('Link title'),
				shortUrl: z.string().describe('Complete short URL'),
				domain: z.string().nullable().describe('Custom domain if any'),
				expiresAt: z.string().nullable().describe('Expiration date'),
				createdAt: z.string().describe('Creation date')
			})
		)
		.describe('Successfully created links'),
	errors: z
		.array(
			z.object({
				index: z.number().describe('Index of the failed link'),
				error: z.string().describe('Error message')
			})
		)
		.describe('Errors for failed links')
});

export const Error = {
	400: error(400, 'Bad request - Invalid input'),
	401: error(401, 'Unauthorized - Invalid API key'),
	403: error(403, 'Forbidden - Insufficient permissions'),
	429: error(429, 'Rate limit exceeded'),
	500: error(500, 'Failed to create links')
};

export const Modifier = (r: RouteConfig) => {
	r.tags = ['Links'];
	r.operationId = 'createBulkLinks';
	r.summary = 'Create multiple shortened links';
	r.description = 'Create multiple shortened links in a single request';
	r.security = [{ bearerAuth: [] }];
	return r;
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(async (input: any, evt) => {
	const authResult = await apiAuth(evt);
	if (authResult instanceof Response) {
		throw Error[401];
	}

	requirePermission(authResult, API_PERMISSIONS.LINKS_WRITE);

	const links = input.links || [];

	const created = [];
	const errors = [];

	for (let i = 0; i < links.length; i++) {
		const linkData = links[i];

		try {
			const { originalUrl, slug, title, password, expiresAt, domain } = linkData;

			if (!isValidUrl(originalUrl)) {
				errors.push({ index: i, error: 'Invalid URL' });
				continue;
			}

			const sanitizedTitle = title ? sanitizeTitle(title) : null;
			if (title && !sanitizedTitle) {
				errors.push({ index: i, error: 'Invalid title' });
				continue;
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
					errors.push({ index: i, error: 'Domain not found or not verified' });
					continue;
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
				: `https://nah.pet/${link.slug}`;

			created.push({
				id: link.id,
				slug: link.slug,
				originalUrl: link.originalUrl,
				title: link.title,
				shortUrl,
				domain: customDomain?.domain || null,
				expiresAt: link.expiresAt?.toISOString() || null,
				createdAt: link.createdAt.toISOString()
			});
		} catch (err) {
			console.error(`Error creating link at index ${i}:`, err);

			let errorMessage = 'Failed to create link';

			// Check for specific error types
			// TODO: Better error handling for prisma errors
			if (err && typeof err === 'object' && 'code' in err) {
				if (err.code === 'P2002') {
					// Prisma unique constraint violation
					errorMessage = 'Slug already exists';
				} else if (err.code === 'P2025') {
					// Record not found
					errorMessage = 'Domain not found or not verified';
				}
			} else if (err && typeof err === 'object' && 'message' in err) {
				// Use the actual error message if available
				const message = err.message as string;
				if (message.includes('slug')) {
					errorMessage = 'Slug already exists';
				} else if (message.includes('domain')) {
					errorMessage = 'Domain not found or not verified';
				} else if (message.includes('url')) {
					errorMessage = 'Invalid URL';
				} else if (message.includes('title')) {
					errorMessage = 'Invalid title';
				}
			}

			errors.push({ index: i, error: errorMessage });
		}
	}

	return {
		success: true,
		created,
		errors
	};
});
