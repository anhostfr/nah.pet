import { nanoid } from 'nanoid';
import { db } from './db.js';

let reservedSlugsCache: Set<string> | null = null;

async function getReservedSlugs(): Promise<Set<string>> {
	if (reservedSlugsCache) return reservedSlugsCache;
	const routeFiles = Object.keys(await import.meta.glob('/src/routes/**/*.svelte'));
	reservedSlugsCache = new Set(
		routeFiles
			.map((path) =>
				path.replace('/src/routes/', '').replace('.svelte', '').replace('/index', '').split('/')
			)
			.flat()
			.filter(Boolean)
			.map((segment) => segment.toLowerCase())
	);
	return reservedSlugsCache;
}

export async function generateUniqueSlug(customSlug?: string): Promise<string> {
	const RESERVED_SLUGS = await getReservedSlugs();

	if (customSlug) {
		if (RESERVED_SLUGS.has(customSlug.toLowerCase())) {
			throw new Error('Ce slug est réservé');
		}
		const exists = await db.link.count({ where: { slug: customSlug } });
		if (exists > 0) {
			throw new Error('Ce slug existe déjà');
		}
		return customSlug;
	}

	const lengths = [4, 5, 6, 7, 8];
	for (const length of lengths) {
		const candidates: string[] = [];
		while (candidates.length < 10) {
			const slug = nanoid(length);
			if (!RESERVED_SLUGS.has(slug.toLowerCase())) {
				candidates.push(slug);
			}
		}

		const existingSlugs = await db.link.findMany({
			where: { slug: { in: candidates } },
			select: { slug: true }
		});
		const usedSlugs = new Set(existingSlugs.map((link) => link.slug));

		for (const candidate of candidates) {
			if (!usedSlugs.has(candidate)) {
				return candidate;
			}
		}
	}

	return `${Date.now().toString(36)}-${nanoid(4)}`;
}
