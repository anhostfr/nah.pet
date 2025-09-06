import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { generateApiKey } from '$lib/server/api-auth.js';
import { randomBytes } from 'crypto';
import type { PageServerLoad, Actions } from './$types';
import { actionFail, actionSuccess } from '$lib/server/response.js';
import { verifyDomainOwnership } from '$lib/server/domain-verification';
import { isRateLimited } from '$lib/server/rateLimit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const apiKeys = await db.apiKey.findMany({
		where: { userId: locals.user.id },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			name: true,
			permissions: true,
			createdAt: true,
			lastUsedAt: true,
			expiresAt: true
		}
	});

	const customDomains = await db.customDomain.findMany({
		where: { userId: locals.user.id },
		orderBy: { createdAt: 'desc' },
		include: {
			_count: {
				select: { links: true }
			}
		}
	});

	return {
		user: locals.user,
		apiKeys,
		customDomains
	};
};

export const actions: Actions = {
	createApiKey: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const permissions = data.getAll('permissions') as string[];

		if (!name || name.length < 3) {
			return actionFail(400, 'settings_res.api_key_name_too_short');
		}

		const key = generateApiKey();

		await db.apiKey.create({
			data: {
				name,
				key,
				permissions,
				userId: locals.user.id
			}
		});

		return actionSuccess('settings_res.api_key_created', { key });
	},

	deleteApiKey: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const keyId = data.get('keyId') as string;

		await db.apiKey.delete({
			where: {
				id: keyId,
				userId: locals.user.id
			}
		});

		return actionSuccess('settings_res.api_key_deleted');
	},

	updateProfile: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email) {
			return actionFail(400, 'settings_res.email_required');
		}

		await db.user.update({
			where: { id: locals.user.id },
			data: { email }
		});

		return actionSuccess('settings_res.profile_updated');
	},

	addDomain: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const domain = data.get('domain') as string;
		const method = data.get('method') as 'dns' | 'file';

		if (!domain || !method) {
			return actionFail(400, 'domains.domain_and_method_required');
		}

		const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
		if (!domainRegex.test(domain)) {
			return actionFail(400, 'domains.invalid_format');
		}

		const existingDomain = await db.customDomain.findFirst({
			where: { domain }
		});

		if (existingDomain) {
			return actionFail(400, 'domains.already_in_use');
		}

		const verificationToken = randomBytes(32).toString('hex');

		await db.customDomain.create({
			data: {
				domain,
				userId: locals.user.id,
				verificationToken,
				verificationMethod: method,
				verified: false
			}
		});

		return actionSuccess('domains.added');
	},

	verifyDomain: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const ip = request.headers.get('x-forwarded-for') || 'unknown';
		const rateLimitKey = `verify_domain:${ip}:${locals.user.id}`;
		if (isRateLimited(rateLimitKey, 10, 300)) {
			return actionFail(429, 'common.too_many_attempts');
		}

		const formData = await request.formData();
		const domainId = formData.get('domainId') as string;

		if (!domainId) {
			return actionFail(400, 'domains_res.domain_id_required');
		}

		const customDomain = await db.customDomain.findFirst({
			where: {
				id: domainId,
				userId: locals.user.id,
				verified: false
			}
		});

		if (!customDomain) {
			return actionFail(404, 'domains_res.not_found_or_already_verified');
		}

		try {
			const result = await verifyDomainOwnership(
				customDomain.domain,
				customDomain.verificationToken,
				customDomain.verificationMethod as 'dns' | 'file'
			);

			if (result.success) {
				await db.customDomain.update({
					where: { id: domainId },
					data: { verified: true }
				});

				return actionSuccess('verified');
			} else {
				return actionFail(400, 'domains_res.verification_failed');
			}
		} catch (error) {
			console.error('Error verifying domain:', error);
			return actionFail(500, 'domains_res.verify_failed');
		}
	},

	deleteDomain: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const domainId = data.get('domainId') as string;

		if (!domainId) {
			return actionFail(400, 'domains.domain_id_required');
		}

		await db.customDomain.delete({
			where: { id: domainId, userId: locals.user.id }
		});

		return actionSuccess('domains.deleted');
	}
};
