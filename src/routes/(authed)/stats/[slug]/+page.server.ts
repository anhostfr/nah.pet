import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user || !locals.user.isAuthorized) {
		throw redirect(302, '/login');
	}

	const { slug } = params;
	const domainParam = url.searchParams.get('domain');

	let link;

	if (domainParam) {
		link = await db.link.findFirst({
			where: {
				slug,
				userId: locals.user.id,
				customDomain: {
					domain: domainParam
				}
			},
			include: {
				customDomain: true
			}
		});
	} else {
		link = await db.link.findFirst({
			where: {
				slug,
				userId: locals.user.id
			},
			include: {
				customDomain: true
			}
		});
	}

	if (!link) {
		throw error(404, 'link.not_found');
	}

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const [totalClicks, clicksToday, clicksThisWeek, clicksThisMonth, recentClicks] =
		await Promise.all([
			db.click.count({
				where: { linkId: link.id }
			}),
			db.click.count({
				where: {
					linkId: link.id,
					createdAt: {
						gte: today
					}
				}
			}),
			db.click.count({
				where: {
					linkId: link.id,
					createdAt: {
						gte: thisWeek
					}
				}
			}),
			db.click.count({
				where: {
					linkId: link.id,
					createdAt: {
						gte: thisMonth
					}
				}
			}),
			db.click.findMany({
				where: { linkId: link.id },
				orderBy: { createdAt: 'desc' },
				take: 50
			})
		]);

	return {
		link,
		stats: {
			totalClicks,
			clicksToday,
			clicksThisWeek,
			clicksThisMonth
		},
		recentClicks
	};
};
