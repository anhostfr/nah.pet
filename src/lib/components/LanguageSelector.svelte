<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
	import { Languages } from 'lucide-svelte';
	import { browser } from '$app/environment';

	type Locale = (typeof locales)[number];
	const currentLang = getLocale();

	const languages = [
		{ value: 'en', label: 'English', flag: '🇺🇸' },
		{ value: 'fr', label: 'Français', flag: '🇫🇷' }
	];

	function handleLanguageChange(value: string | undefined) {
		if (value && browser && locales.includes(value as Locale)) {
			setLocale(value as Locale, { reload: true });
		}
	}
</script>

<Select.Root type="single" value={currentLang} onValueChange={handleLanguageChange}>
	<Select.Trigger class="h-8 flex items-center gap-2">
		<Languages class="w-4 h-4" />
		{languages.find((lang) => lang.value === currentLang)?.flag}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each languages as lang}
				<Select.Item value={lang.value}>
					<div class="flex items-center gap-2">
						<span>{lang.flag}</span>
						<span>{lang.label}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
