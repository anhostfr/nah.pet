import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { db } from './db.js';
import { dev } from '$app/environment';

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		name: 'session',
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}
