import { type ClassValue, clsx } from 'clsx';
import { MediaQuery } from 'svelte/reactivity';
import { twMerge } from 'tailwind-merge';
import { getLocale } from './paraglide/runtime';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const actualLocale = getLocale() || 'fr';

export function formatDate(date: Date | string | number | null | undefined): string {
	if (!date) return '';
	const d = new Date(date as any);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat(actualLocale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(d);
}

export function formatNumber(num: number): string {
	return new Intl.NumberFormat(actualLocale).format(num);
}

export function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch (_) {
		return false;
	}
}

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;

export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMobile() {
	return new MediaQuery('max-width: 768px').current;
}
