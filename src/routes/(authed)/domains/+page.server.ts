import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { actionFail, actionSuccess } from '$lib/server/response.js';
import {
	generateVerificationToken,
	verifyDomainOwnership,
	validateDomainFormat,
	isDomainAllowed
} from '$lib/server/domain-verification';
import { isRateLimited } from '$lib/server/rateLimit';

const MAX_DOMAINS_PER_USER = 3;

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

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
		customDomains
	};
};

export const actions: Actions = {
	addDomain: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const ip = getClientAddress();
		const rateLimitKey = `add_domain:${ip}:${locals.user.id}`;
		if (isRateLimited(rateLimitKey, 5, 300)) {
			return actionFail(429, 'common.too_many_attempts');
		}

		const formData = await request.formData();
		const domain = (formData.get('domain') as string)?.trim().toLowerCase();
		const verificationMethod = formData.get('method') as 'dns' | 'file';

		if (!domain) {
			return actionFail(400, 'domains_res.domain_required');
		}

		if (!validateDomainFormat(domain)) {
			return actionFail(400, 'domains_res.invalid_format');
		}

		if (!isDomainAllowed(domain)) {
			return actionFail(400, 'domains_res.not_allowed');
		}

		if (!['dns', 'file'].includes(verificationMethod)) {
			return actionFail(400, 'domains_res.invalid_verification_method');
		}

		const domainCount = await db.customDomain.count({
			where: { userId: locals.user.id }
		});

		/* if (domainCount >= MAX_DOMAINS_PER_USER) {
			return actionFail(400, 'domains_res.limit_reached');
		} */

		const existingDomain = await db.customDomain.findUnique({
			where: { domain }
		});

		if (existingDomain) {
			return actionFail(400, 'domains_res.already_registered');
		}

		const verificationToken = generateVerificationToken();

		try {
			await db.customDomain.create({
				data: {
					domain,
					userId: locals.user.id,
					verificationToken,
					verificationMethod,
					verified: false
				}
			});

			return actionSuccess('domains_res.added', {
				verificationToken,
				verificationMethod,
				domain
			});
		} catch (error) {
			console.error('Error adding domain:', error);
			return actionFail(500, 'domains_res.add_failed');
		}
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

	deleteDomain: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const domainId = formData.get('domainId') as string;

		if (!domainId) {
			return actionFail(400, 'domains_res.domain_id_required');
		}

		const customDomain = await db.customDomain.findFirst({
			where: {
				id: domainId,
				userId: locals.user.id
			},
			include: {
				_count: { select: { links: true } }
			}
		});

		if (!customDomain) {
			return actionFail(404, 'domains_res.not_found');
		}

		try {
			const linkCount = customDomain._count.links;

			await db.customDomain.delete({
				where: { id: domainId }
			});

			return actionSuccess('domains_res.deleted_with_links', { linkCount });
		} catch (error) {
			console.error('Error deleting domain:', error);
			return actionFail(500, 'domains_res.delete_failed');
		}
	}
};
