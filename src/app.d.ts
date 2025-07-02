import type { User, Session } from 'lucia';
import type { CustomDomain, User as PrismaUser } from '@prisma/client';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
			customDomain: (CustomDomain & { user: PrismaUser }) | null;
			isCustomDomain: boolean;
		}
	}
}

export {};
