import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

const globalPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db =
	globalPrisma.prisma ??
	new PrismaClient({
		log: dev ? ['query', 'info', 'warn', 'error'] : ['error']
	});

if (dev) globalPrisma.prisma = db;
