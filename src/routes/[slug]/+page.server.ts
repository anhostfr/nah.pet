import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { verify } from '@node-rs/argon2';
import { sleep } from '$lib/utils';
import { isRateLimited } from '$lib/server/rateLimit';

export const load: PageServerLoad = async ({ params, request, getClientAddress }) => {
	const { slug } = params;

	const link = await db.link.findUnique({
		where: { slug }
	});

	if (!link) {
		throw error(404, 'Lien introuvable');
	}

	if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
		throw error(410, 'Ce lien a expiré');
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
	verify: async ({ request, params, getClientAddress }) => {
		const { slug } = params;
		const formData = await request.formData();
		const password = formData.get('password') as string;

		const link = await db.link.findUnique({
			where: { slug }
		});

		if (!link || !link.password) {
			throw error(404, 'Lien introuvable');
		}

		const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const rateLimitKey = `slug:${ip}:${slug}`;
		if (isRateLimited(rateLimitKey)) {
			await sleep(2000);
			return fail(429, { error: 'Trop de tentatives, réessayez plus tard.' });
		}

		if (!password) {
			return fail(400, { error: 'Mot de passe requis' });
		}

		const isValidPassword = await verify(link.password, password);

		if (!isValidPassword) {
			sleep(2000);
			return fail(400, { error: 'Mot de passe incorrect' });
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
