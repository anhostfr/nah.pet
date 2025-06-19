import { nanoid } from 'nanoid';
import { db } from './db.js';

export async function generateUniqueSlug(customSlug?: string, length = 6): Promise<string> {
	if (customSlug) {
		const existingLink = await db.link.findUnique({
			where: { slug: customSlug }
		});

		if (existingLink) {
			throw new Error('This slug is already taken.');
		}

		return customSlug;
	}

	let slug: string;
	let attempts = 0;
	const maxAttempts = 10;

	do {
		slug = nanoid(length);
		const existingLink = await db.link.findUnique({
			where: { slug }
		});

		if (!existingLink) {
			return slug;
		}

		attempts++;
		if (attempts >= maxAttempts) {
			length++;
			attempts = 0;
		}
	} while (true);
}
