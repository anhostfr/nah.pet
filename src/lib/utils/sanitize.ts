import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(input: string): string {
	return DOMPurify.sanitize(input, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true
	});
}

export function sanitizeTitle(title: string): string {
	if (!title || typeof title !== 'string') {
		return '';
	}

	if (title.length > 255) {
		title = title.substring(0, 255);
	}

	return sanitizeHtml(title).trim();
}

export function validateExpiresAt(expiresAt: string): boolean {
	try {
		const date = new Date(expiresAt);
		const now = new Date();

		if (isNaN(date.getTime())) {
			return false;
		}

		if (date <= now) {
			return false;
		}

		const maxDate = new Date();
		maxDate.setFullYear(maxDate.getFullYear() + 10);
		if (date > maxDate) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}
