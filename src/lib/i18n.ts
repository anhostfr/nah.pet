import * as m from '$lib/paraglide/messages.js';

export function tKey(key: string | undefined, params?: Record<string, unknown>): string {
	if (!key) return '';
	const dict = m as unknown as Record<string, (args?: Record<string, unknown>) => string>;
	const fn = dict[key];
	if (typeof fn === 'function') {
		return fn(params ?? {});
	}
	return key;
}
