import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { lucia } from '$lib/server/auth.js';
import { hash } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!email || !password || !confirmPassword) {
			return fail(400, { error: 'Tous les champs sont requis' });
		}

		if (
			typeof email !== 'string' ||
			typeof password !== 'string' ||
			typeof confirmPassword !== 'string'
		) {
			return fail(400, { error: 'Données invalides' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Les mots de passe ne correspondent pas' });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Le mot de passe doit contenir au moins 8 caractères' });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, { error: 'Email invalide' });
		}

		try {
			const existingUser = await db.user.findUnique({
				where: { email: email.toLowerCase() }
			});

			if (existingUser) {
				return fail(400, { error: 'Un compte avec cet email existe déjà' });
			}

			const hashedPassword = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			const user = await db.user.create({
				data: {
					email: email.toLowerCase(),
					password: hashedPassword
				}
			});

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true, redirectTo: '/' };
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			console.error("Erreur lors de l'inscription:", error);
			return fail(500, { error: 'Erreur serveur' });
		}
	}
};
