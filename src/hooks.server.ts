import { PUBLIC_MAIN_DOMAIN } from '$env/static/public';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { type Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authHandle: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host');
	const customDomain = await detectCustomDomain(host);

	const isUnknownDomain =
		host &&
		!host.includes('localhost') &&
		!host.includes('127.0.0.1') &&
		!host.includes('0.0.0.0') &&
		host !== PUBLIC_MAIN_DOMAIN &&
		!host.startsWith(PUBLIC_MAIN_DOMAIN + ':') &&
		!customDomain;

	if (isUnknownDomain) {
		throw redirect(
			302,
			`https://${PUBLIC_MAIN_DOMAIN}/domain-not-found?domain=${encodeURIComponent(host)}`
		);
	}

	event.locals.customDomain = customDomain;
	event.locals.isCustomDomain = !!customDomain;

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		event.locals.user = user;
		event.locals.session = session;
	}

	if (customDomain && customDomain.verified) {
		const pathname = event.url.pathname;
		const systemRoutes = [
			'/login',
			'/register',
			'/logout',
			'/admin',
			'/stats',
			'/domains',
			'/pending',
			'/settings',
			'/profile',
			'/account',
			'/api',
			'/dashboard'
		];
		const isSystemRoute = systemRoutes.some(
			(route) => pathname === route || pathname.startsWith(route + '/')
		);
		if (isSystemRoute) {
			return new Response('Not Found', { status: 404 });
		}
	}

	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle = sequence(handleParaglide, authHandle);

async function detectCustomDomain(host: string | null) {
	if (!host) return null;
	if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0')) {
		return null;
	}
	if (host === PUBLIC_MAIN_DOMAIN || host.startsWith(PUBLIC_MAIN_DOMAIN + ':')) {
		return null;
	}
	try {
		const customDomain = await db.customDomain.findUnique({
			where: { domain: host },
			include: { user: true }
		});
		return customDomain;
	} catch (error) {
		console.error('Error detecting custom domain:', error);
		return null;
	}
}
