import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { verify } from '@node-rs/argon2';
import { sleep } from '$lib/utils';
import { isRateLimited } from '$lib/server/rateLimit';
import { isSlugReserved } from '$lib/server/domain-verification';
import { actionFail } from '$lib/server/response.js';

export const load: PageServerLoad = async ({ params, request, getClientAddress, locals }) => {
	const { slug } = params;

	let link;

	if (locals.isCustomDomain && locals.customDomain?.verified) {
		if (isSlugReserved(slug)) {
			throw error(404, 'Not found');
		}

		link = await db.link.findFirst({
			where: {
				slug,
				customDomainId: locals.customDomain.id,
				userId: locals.customDomain.userId
			}
		});
	} else {
		link = await db.link.findFirst({
			where: {
				slug,
				customDomainId: null
			}
		});
	}

	if (!link) {
		throw error(404, 'Not found');
	}

	if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
		throw error(410, 'expired_link');
	}

	if (link.password) {
		return {
			link: {
				slug: link.slug,
				title: link.title,
				hasPassword: true
			}
		};
	}

	const userAgent = request.headers.get('user-agent') || '';
	const ip = request.headers.get('cf-connecting-ip') || getClientAddress();

	await db.click.create({
		data: {
			linkId: link.id,
			ip,
			userAgent
		}
	});

	throw redirect(302, link.originalUrl);
};

export const actions: Actions = {
	verify: async ({ request, params, getClientAddress, locals }) => {
		const { slug } = params;
		const formData = await request.formData();
		const password = formData.get('password') as string;

		let link;

		if (locals.isCustomDomain && locals.customDomain?.verified) {
			if (isSlugReserved(slug!)) {
				throw error(404, '');
			}

			link = await db.link.findFirst({
				where: {
					slug,
					customDomainId: locals.customDomain.id,
					userId: locals.customDomain.userId
				}
			});
		} else {
			link = await db.link.findFirst({
				where: {
					slug,
					customDomainId: null
				}
			});
		}

		if (!link || !link.password) {
			throw error(404, 'Not found');
		}

		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const rateLimitKey = `slug:${ip}:${slug}`;
		if (isRateLimited(rateLimitKey)) {
			await sleep(2000);
			return actionFail(429, 'too_many_attempts');
		}

		if (!password) {
			return actionFail(400, 'password_required');
		}

		const isValidPassword = await verify(link.password, password);

		if (!isValidPassword) {
			sleep(2000);
			return actionFail(400, 'password_incorrect');
		}

		const userAgent = request.headers.get('user-agent') || '';

		await db.click.create({
			data: {
				linkId: link.id,
				ip,
				userAgent
			}
		});

		throw redirect(302, link.originalUrl);
	}
};
