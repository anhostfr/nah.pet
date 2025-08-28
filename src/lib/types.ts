export type NormalizedActionData = {
	success?: boolean;
	messageKey?: string;
	redirectTo?: string;
	error?: string;
	key?: string;
	link?: { id: string; slug: string; originalUrl: string; title?: string | null };
	shortUrl?: string;
	qrCode?: string;
	[key: string]: unknown;
};
