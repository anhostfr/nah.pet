import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const [
		totalLinks,
		totalClicks,
		clicksToday,
		clicksYesterday,
		clicksThisWeek,
		clicksThisMonth,
		topLinks,
		recentClicks
	] = await Promise.all([
		db.link.count({
			where: { userId: locals.user.id }
		}),

		db.click.count({
			where: {
				link: { userId: locals.user.id }
			}
		}),

		db.click.count({
			where: {
				link: { userId: locals.user.id },
				createdAt: { gte: today }
			}
		}),

		db.click.count({
			where: {
				link: { userId: locals.user.id },
				createdAt: {
					gte: yesterday,
					lt: today
				}
			}
		}),

		db.click.count({
			where: {
				link: { userId: locals.user.id },
				createdAt: { gte: thisWeek }
			}
		}),

		db.click.count({
			where: {
				link: { userId: locals.user.id },
				createdAt: { gte: thisMonth }
			}
		}),

		db.link.findMany({
			where: { userId: locals.user.id },
			include: {
				_count: {
					select: { clicks: true }
				}
			},
			orderBy: {
				clicks: {
					_count: 'desc'
				}
			},
			take: 10
		}),

		db.click.findMany({
			where: {
				link: { userId: locals.user.id }
			},
			include: {
				link: {
					select: {
						slug: true,
						title: true,
						originalUrl: true
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: 20
		})
	]);

	const todayGrowth =
		clicksYesterday > 0 ? ((clicksToday - clicksYesterday) / clicksYesterday) * 100 : 0;

	const weekGrowthPrevious = await db.click.count({
		where: {
			link: { userId: locals.user.id },
			createdAt: {
				gte: new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
				lt: thisWeek
			}
		}
	});

	const weekGrowth =
		weekGrowthPrevious > 0 ? ((clicksThisWeek - weekGrowthPrevious) / weekGrowthPrevious) * 100 : 0;

	return {
		stats: {
			totalLinks,
			totalClicks,
			clicksToday,
			clicksYesterday,
			clicksThisWeek,
			clicksThisMonth,
			todayGrowth: Math.round(todayGrowth * 10) / 10,
			weekGrowth: Math.round(weekGrowth * 10) / 10,
			avgClicksPerLink: totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0
		},
		topLinks,
		recentClicks
	};
};
