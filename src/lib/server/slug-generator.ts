import { nanoid } from 'nanoid';
import { db } from './db.js';

let reservedSlugsCache: Set<string> | null = null;

async function getReservedSlugs(): Promise<Set<string>> {
	if (reservedSlugsCache) return reservedSlugsCache;
	const svelteFiles = await import.meta.glob('/src/routes/**/*.svelte');
	const tsFiles = await import.meta.glob('/src/routes/**/*.ts');
	const routeFiles = Object.keys({ ...svelteFiles, ...tsFiles });
	reservedSlugsCache = new Set(
		routeFiles
			.map((path) =>
				path.replace('/src/routes/', '').replace('.svelte', '').replace('/index', '').split('/')
				.map((segment) => segment.replace(/^\+/, '').replace(/\.ts$/, ''))
				.filter((segment) => segment && !segment.startsWith('_') && !segment.startsWith('[') && !segment.endsWith(']'))
			)
			.flat()
			.filter(Boolean)
			.map((segment) => segment.toLowerCase())
	);

	return reservedSlugsCache;
}

export async function generateUniqueSlug(customSlug?: string, customDomainId?: string): Promise<string> {
	const RESERVED_SLUGS = await getReservedSlugs();

	function isValidSlug(slug: string): boolean {
		const forbiddenChars = ['/', '.', '\\', ':', '*', '?', '"', '<', '>', '|', '&', '%', '#', '@', '!', '=', '+', ';', ',', '(', ')', '[', ']', '{', '}', '~', '`', '^', ' ', '\t', '\n', '\r'];
		return !forbiddenChars.some(char => slug.includes(char));
	}

	if (customSlug) {
		if (!isValidSlug(customSlug)) {
			throw new Error('Le slug contient des caractères non autorisés (/, ., \\, :, *, ?, etc.)');
		}
		
		if (RESERVED_SLUGS.has(customSlug.toLowerCase())) {
			throw new Error('Ce slug est réservé');
		}
		
		
		const exists = await db.link.count({ 
			where: { 
				slug: customSlug,
				customDomainId: customDomainId || null
			} 
		});
		if (exists > 0) {
			throw new Error('Ce slug personnalisé existe déjà');
		}
		return customSlug;
	}

	const lengths = [4, 5, 6, 7, 8];
	for (const length of lengths) {
		const candidates: string[] = [];
		while (candidates.length < 10) {
			const slug = nanoid(length);
			if (!RESERVED_SLUGS.has(slug.toLowerCase()) && isValidSlug(slug)) {
				candidates.push(slug);
			}
		}

		const existingSlugs = await db.link.findMany({
			where: { 
				slug: { in: candidates },
				customDomainId: customDomainId || null
			},
			select: { slug: true }
		});
		const usedSlugs = new Set(existingSlugs.map((link) => link.slug));

		for (const candidate of candidates) {
			if (!usedSlugs.has(candidate)) {
				return candidate;
			}
		}
	}

	const timestamp = Date.now().toString(36);
	const randomPart = nanoid(4);
	return `${timestamp}-${randomPart}`;
}
