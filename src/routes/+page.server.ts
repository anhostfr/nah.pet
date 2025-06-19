import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { generateUniqueSlug } from '$lib/server/slug-generator.js';
import { generateQRCode } from '$lib/server/qr-generator.js';
import { isValidUrl } from '$lib/utils.js';
import { hash } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.user.isAuthorized) {
		throw redirect(302, '/login');
	}

	const currentDate = new Date();
	const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

	const [links, stats] = await Promise.all([
		db.link.findMany({
			where: { userId: locals.user.id },
			include: {
				_count: {
					select: { clicks: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		}),
		db.link.aggregate({
			where: { userId: locals.user.id },
			_count: {
				id: true
			}
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

		if (!originalUrl) {
			return fail(400, { error: 'URL requise' });
		}

		if (!isValidUrl(originalUrl)) {
			return fail(400, { error: 'URL invalide' });
		}

		try {
			const slug = await generateUniqueSlug(customSlug || undefined);

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
					userId: locals.user.id
				}
			});

			const shortUrl = `${url.origin}/${slug}`;
			const qrCode = await generateQRCode(shortUrl);

			return {
				success: true,
				link: {
					id: link.id,
					slug: link.slug,
					originalUrl: link.originalUrl,
					title: link.title
				},
				qrCode
			};
		} catch (error) {
			console.error('Erreur lors de la création du lien:', error);

			if (error instanceof Error && error.message.includes('slug personnalisé existe déjà')) {
				return fail(400, { error: 'Ce slug personnalisé est déjà utilisé' });
			}

			return fail(500, { error: 'Erreur lors de la création du lien' });
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

			return { success: true };
		} catch (error) {
			console.error('Erreur lors de la suppression:', error);
			return fail(500, { error: 'Erreur lors de la suppression du lien' });
		}
	}
};
