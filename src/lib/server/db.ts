import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

const globalPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db = globalPrisma.prisma ?? new PrismaClient({});

if (dev) globalPrisma.prisma = db;
