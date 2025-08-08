import { db } from './db.js';
import { randomBytes } from 'crypto';

export interface ApiKeyContext {
	id: string;
	userId: string;
	permissions: string[];
	user: {
		id: string;
		email: string;
		isActive: boolean;
		isAdmin: boolean;
	};
}

export async function validateApiKey(key: string): Promise<ApiKeyContext | null> {
	if (!key) return null;

	const apiKey = await db.apiKey.findUnique({
		where: { key },
		include: { user: true }
	});

	if (!apiKey) {
		return null;
	}

	if (!apiKey.user.isActive) {
		return null;
	}

	if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
		return null;
	}

	await db.apiKey.update({
		where: { id: apiKey.id },
		data: { lastUsedAt: new Date() }
	});

	return {
		id: apiKey.id,
		userId: apiKey.userId,
		permissions: apiKey.permissions,
		user: {
			id: apiKey.user.id,
			email: apiKey.user.email,
			isActive: apiKey.user.isActive,
			isAdmin: apiKey.user.isAdmin
		}
	};
}

export function hasPermission(context: ApiKeyContext, permission: string): boolean {
	return context.permissions.includes(permission) || context.user.isAdmin;
}

export function generateApiKey(): string {
	const prefix = 'nah_';
	const key = randomBytes(32).toString('hex');
	return prefix + key;
}

export const API_PERMISSIONS = {
	LINKS_READ: 'links:read',
	LINKS_WRITE: 'links:write',
	STATS_READ: 'stats:read'
} as const;

export type ApiPermission = (typeof API_PERMISSIONS)[keyof typeof API_PERMISSIONS];
