import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
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
			return fail(429, { 
				error: 'Trop de tentatives. Veuillez attendre avant de réessayer.' 
			});
		}

		const formData = await request.formData();
		const domain = (formData.get('domain') as string)?.trim().toLowerCase();
		const verificationMethod = formData.get('method') as 'dns' | 'file';

		if (!domain) {
			return fail(400, { error: 'Le domaine est requis' });
		}

		if (!validateDomainFormat(domain)) {
			return fail(400, { error: 'Format de domaine invalide' });
		}

		if (!isDomainAllowed(domain)) {
			return fail(400, { 
				error: 'Ce domaine n\'est pas autorisé (domaine principal, localhost, IP, etc.)' 
			});
		}

		if (!['dns', 'file'].includes(verificationMethod)) {
			return fail(400, { error: 'Méthode de vérification invalide' });
		}

		
		const domainCount = await db.customDomain.count({
			where: { userId: locals.user.id }
		});

		if (domainCount >= MAX_DOMAINS_PER_USER) {
			return fail(400, { 
				error: `Limite de ${MAX_DOMAINS_PER_USER} domaines atteinte` 
			});
		}

		
		const existingDomain = await db.customDomain.findUnique({
			where: { domain }
		});

		if (existingDomain) {
			return fail(400, { 
				error: 'Ce domaine est déjà enregistré' 
			});
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

			return { 
				success: true, 
				message: 'Domaine ajouté avec succès. Procédez à la vérification.',
				verificationToken,
				verificationMethod,
				domain
			};
		} catch (error) {
			console.error('Error adding domain:', error);
			return fail(500, { error: 'Erreur lors de l\'ajout du domaine' });
		}
	},

	verifyDomain: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		
		const ip = request.headers.get('x-forwarded-for') || 'unknown';
		const rateLimitKey = `verify_domain:${ip}:${locals.user.id}`;
		if (isRateLimited(rateLimitKey, 10, 300)) {
			return fail(429, { 
				error: 'Trop de tentatives de vérification. Veuillez attendre.' 
			});
		}

		const formData = await request.formData();
		const domainId = formData.get('domainId') as string;

		if (!domainId) {
			return fail(400, { error: 'ID du domaine requis' });
		}

		const customDomain = await db.customDomain.findFirst({
			where: {
				id: domainId,
				userId: locals.user.id,
				verified: false
			}
		});

		if (!customDomain) {
			return fail(404, { 
				error: 'Domaine introuvable ou déjà vérifié' 
			});
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

				return {
					success: true,
					message: 'Domaine vérifié avec succès!'
				};
			} else {
				return fail(400, {
					error: `Vérification échouée: ${result.error}`
				});
			}
		} catch (error) {
			console.error('Error verifying domain:', error);
			return fail(500, { 
				error: 'Erreur lors de la vérification du domaine' 
			});
		}
	},

	deleteDomain: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const domainId = formData.get('domainId') as string;

		if (!domainId) {
			return fail(400, { error: 'ID du domaine requis' });
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
			return fail(404, { error: 'Domaine introuvable' });
		}

		try {
			const linkCount = customDomain._count.links;
			
			await db.customDomain.delete({
				where: { id: domainId }
			});

			const message = linkCount > 0 
				? `Domaine supprimé avec succès (${linkCount} lien${linkCount > 1 ? 's' : ''} supprimé${linkCount > 1 ? 's' : ''})`
				: 'Domaine supprimé avec succès';

			return {
				success: true,
				message
			};
		} catch (error) {
			console.error('Error deleting domain:', error);
			return fail(500, { 
				error: 'Erreur lors de la suppression du domaine' 
			});
		}
	}
};