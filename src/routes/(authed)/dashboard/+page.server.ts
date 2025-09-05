import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { generateUniqueSlug } from '$lib/server/slug-generator.js';
import { generateQRCode } from '$lib/server/qr-generator.js';
import { isValidUrl } from '$lib/utils.js';
import { hash } from '@node-rs/argon2';
import { isSlugReserved } from '$lib/server/domain-verification';
import { env } from '$env/dynamic/public';
import { actionFail, actionSuccess } from '$lib/server/response.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.user.isAuthorized) {
		throw redirect(302, '/login');
	}

	const currentDate = new Date();
	const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

	const [links, stats, customDomains] = await Promise.all([
		db.link.findMany({
			where: { userId: locals.user.id },
			include: {
				_count: {
					select: { clicks: true }
				},
				customDomain: true
			},
			orderBy: { createdAt: 'desc' }
		}),
		db.link.aggregate({
			where: { userId: locals.user.id },
			_count: {
				id: true
			}
		}),
		db.customDomain.findMany({
			where: {
				userId: locals.user.id,
				verified: true
			},
			orderBy: { domain: 'asc' }
		})
	]);

	const totalClicks = await db.click.count({
		where: {
			link: {
				userId: locals.user.id
			}
		}
	});

	const clicksThisMonth = await db.click.count({
		where: {
			link: {
				userId: locals.user.id
			},
			createdAt: {
				gte: startOfMonth
			}
		}
	});

	const linksThisMonth = await db.link.count({
		where: {
			userId: locals.user.id,
			createdAt: {
				gte: startOfMonth
			}
		}
	});

	const activeLinks = links.filter(
		(link) => !link.expiresAt || new Date() <= new Date(link.expiresAt)
	).length;

	const expiredLinks = links.length - activeLinks;

	return {
		links,
		customDomains,
		stats: {
			totalLinks: links.length,
			totalClicks,
			clicksThisMonth,
			linksThisMonth,
			activeLinks,
			expiredLinks
		}
	};
};

export const actions: Actions = {
	create: async ({ request, locals, url }) => {
		if (!locals.user || !locals.user.isAuthorized) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const originalUrl = formData.get('originalUrl') as string;
		const customSlug = formData.get('customSlug') as string;
		const title = formData.get('title') as string;
		const password = formData.get('password') as string;
		const expiresAt = formData.get('expiresAt') as string;
		const customDomainId = formData.get('customDomainId') as string;

		if (!originalUrl) {
			return actionFail(400, 'links.url_required');
		}

		if (!isValidUrl(originalUrl)) {
			return actionFail(400, 'links.url_invalid');
		}

		let verifiedCustomDomain = null;
		if (customDomainId && customDomainId !== '') {
			verifiedCustomDomain = await db.customDomain.findFirst({
				where: {
					id: customDomainId,
					userId: locals.user.id,
					verified: true
				}
			});

			if (!verifiedCustomDomain) {
				return actionFail(400, 'domains.invalid_or_unverified_custom_domain');
			}

			if (customSlug && isSlugReserved(customSlug)) {
				return actionFail(400, 'links.reserved_slug_on_custom_domain');
			}
		}

		try {
			const slug = await generateUniqueSlug(customSlug || undefined, verifiedCustomDomain?.id);

			const hashedPassword = password
				? await hash(password, {
						memoryCost: 19456,
						timeCost: 2,
						outputLen: 32,
						parallelism: 1
					})
				: null;
			const expirationDate = expiresAt ? new Date(expiresAt) : null;

			const link = await db.link.create({
				data: {
					originalUrl,
					slug,
					title: title || null,
					password: hashedPassword,
					expiresAt: expirationDate,
					userId: locals.user.id,
					customDomainId: verifiedCustomDomain?.id || null
				}
			});

			const shortUrl = verifiedCustomDomain
				? `https://${verifiedCustomDomain.domain}/${slug}`
				: `${env.PUBLIC_MAIN_DOMAIN}/${slug}`;
			const qrCode = await generateQRCode(shortUrl);

			return actionSuccess('links.created', {
				link: {
					id: link.id,
					slug: link.slug,
					originalUrl: link.originalUrl,
					title: link.title
				},
				shortUrl,
				qrCode
			});
		} catch (error) {
			console.error('Erreur lors de la création du lien:', error);

			if (error instanceof Error && error.message.includes('slug personnalisé existe déjà')) {
				return actionFail(400, 'links.custom_slug_taken');
			}

			return actionFail(500, 'links.create_failed');
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAuthorized) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const linkId = formData.get('linkId') as string;

		try {
			await db.link.delete({
				where: {
					id: linkId,
					userId: locals.user.id
				}
			});

			return actionSuccess('links.deleted');
		} catch (error) {
			console.error('Erreur lors de la suppression:', error);
			return actionFail(500, 'links.delete_failed');
		}
	}
};
