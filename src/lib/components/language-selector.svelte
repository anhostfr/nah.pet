<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
	import { Languages } from 'lucide-svelte';
	import { browser } from '$app/environment';

	type Locale = (typeof locales)[number];
	const currentLang = getLocale();

	function toFlag(region?: string): string {
		if (!region) return '🌐';
		return region
			.toUpperCase()
			.replace(/[^A-Z]/g, '')
			.split('')
			.map((c) => String.fromCodePoint(0x1f1e6 + (c.charCodeAt(0) - 65)))
			.join('');
	}

	function regionToTwemojiSvg(region?: string): string | null {
		if (!region) return null;
		const letters = region.toUpperCase().replace(/[^A-Z]/g, '').split('');
		if (letters.length !== 2) return null;
		const cps = letters.map((c) => (0x1f1e6 + (c.charCodeAt(0) - 65)).toString(16));
		const filename = `${cps[0]}-${cps[1]}.svg`;
		return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${filename}`;
	}

	function getRegionFromLocale(tag: string): string | undefined {
		try {
			const loc = new Intl.Locale(tag).maximize?.() ?? new Intl.Locale(tag);
			const base = tag.split('-')[0].toLowerCase();
			if (base === 'en') return 'GB';
			return loc.region;
		} catch {
			return tag.split('-')[0].toLowerCase() === 'en' ? 'GB' : undefined;
		}
	}

	const languageNames = new Intl.DisplayNames([currentLang || 'en'], { type: 'language' });
	const languages = locales.map((l) => {
		const region = getRegionFromLocale(l);
		const name = languageNames.of(l);
		return {
			value: l,
			label: name ? name.charAt(0).toUpperCase() + name.slice(1) : l.toUpperCase(),
			flag: toFlag(region),
			flagSrc: regionToTwemojiSvg(region)
		};
	});

	function handleLanguageChange(value: string | undefined) {
		if (value && browser && locales.includes(value as Locale)) {
			setLocale(value as Locale, { reload: true });
		}
	}
</script>

<Select.Root type="single" value={currentLang} onValueChange={handleLanguageChange}>
	<Select.Trigger class="h-8 flex items-center gap-2 w-20">
		<Languages class="w-4 h-4" />
		{#if languages.find((lang) => lang.value === currentLang)?.flagSrc}
			<img
				src={languages.find((lang) => lang.value === currentLang)!.flagSrc}
				alt=""
				class="w-4 h-4 object-contain"
				aria-hidden="true"
			/>
		{:else}
			<span class="inline-flex items-center justify-center w-4 h-4 leading-none text-base" style="font-variant-emoji: emoji;">
				{languages.find((lang) => lang.value === currentLang)?.flag}
			</span>
		{/if}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each languages as lang}
				<Select.Item value={lang.value}>
					<div class="flex items-center gap-2">
						{#if lang.flagSrc}
							<img src={lang.flagSrc} alt="" class="w-4 h-4 object-contain" aria-hidden="true" />
						{:else}
							<span class="inline-flex items-center justify-center w-4 h-4 leading-none text-base" style="font-variant-emoji: emoji;">{lang.flag}</span>
						{/if}
						<span>{lang.label}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
