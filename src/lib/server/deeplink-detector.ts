export interface DeepLinkPattern {
	platform: 'iOS' | 'Android';
	urlPattern: RegExp;
	deepLinkTemplate: string;
	extractParams: (url: string, match: RegExpMatchArray) => Record<string, string>;
}

export const DEEPLINK_PATTERNS: DeepLinkPattern[] = [
	// Instagram
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)\/?/,
		deepLinkTemplate: 'instagram://media?id={mediaId}',
		extractParams: (url, match) => ({ mediaId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)\/?/,
		deepLinkTemplate:
			'intent://www.instagram.com/p/{mediaId}#Intent;package=com.instagram.android;scheme=https;end',
		extractParams: (url, match) => ({ mediaId: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/,
		deepLinkTemplate: 'instagram://user?username={username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/,
		deepLinkTemplate:
			'intent://www.instagram.com/{username}#Intent;package=com.instagram.android;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/stories\/([a-zA-Z0-9_.]+)\/?/,
		deepLinkTemplate: 'instagram://user?username={username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?instagram\.com\/stories\/([a-zA-Z0-9_.]+)\/?/,
		deepLinkTemplate:
			'intent://www.instagram.com/stories/{username}#Intent;package=com.instagram.android;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	},

	// TikTok
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/video\/(\d+)/,
		deepLinkTemplate: 'snssdk1233://video/{videoId}',
		extractParams: (url, match) => ({ username: match[1], videoId: match[2] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/video\/(\d+)/,
		deepLinkTemplate:
			'intent://www.tiktok.com/@{username}/video/{videoId}#Intent;package=com.zhiliaoapp.musically;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1], videoId: match[2] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:vm\.)?tiktok\.com\/([a-zA-Z0-9]+)\/?/,
		deepLinkTemplate: 'snssdk1233://aweme/detail/{shortId}',
		extractParams: (url, match) => ({ shortId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:vm\.)?tiktok\.com\/([a-zA-Z0-9]+)\/?/,
		deepLinkTemplate:
			'intent://vm.tiktok.com/{shortId}#Intent;package=com.zhiliaoapp.musically;scheme=https;end',
		extractParams: (url, match) => ({ shortId: match[1] })
	},

	// YouTube
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
		deepLinkTemplate: 'youtube://watch?v={videoId}',
		extractParams: (url, match) => ({ videoId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
		deepLinkTemplate:
			'intent://www.youtube.com/watch?v={videoId}#Intent;package=com.google.android.youtube;scheme=https;end',
		extractParams: (url, match) => ({ videoId: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
		deepLinkTemplate: 'youtube://channel/{channelId}',
		extractParams: (url, match) => ({ channelId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
		deepLinkTemplate:
			'intent://www.youtube.com/channel/{channelId}#Intent;package=com.google.android.youtube;scheme=https;end',
		extractParams: (url, match) => ({ channelId: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?youtube\.com\/@([a-zA-Z0-9_.-]+)/,
		deepLinkTemplate: 'youtube://@{handle}',
		extractParams: (url, match) => ({ handle: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?youtube\.com\/@([a-zA-Z0-9_.-]+)/,
		deepLinkTemplate:
			'intent://www.youtube.com/@{handle}#Intent;package=com.google.android.youtube;scheme=https;end',
		extractParams: (url, match) => ({ handle: match[1] })
	},

	// Twitter/X
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
		deepLinkTemplate: 'twitter://status?id={statusId}',
		extractParams: (url, match) => ({ username: match[1], statusId: match[2] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
		deepLinkTemplate:
			'intent://twitter.com/{username}/status/{statusId}#Intent;package=com.twitter.android;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1], statusId: match[2] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate: 'twitter://user?screen_name={username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate:
			'intent://twitter.com/{username}#Intent;package=com.twitter.android;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	},

	// LinkedIn
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)\/?/,
		deepLinkTemplate: 'linkedin://profile/{profileId}',
		extractParams: (url, match) => ({ profileId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)\/?/,
		deepLinkTemplate:
			'intent://www.linkedin.com/in/{profileId}#Intent;package=com.linkedin.android;scheme=https;end',
		extractParams: (url, match) => ({ profileId: match[1] })
	},

	// Twitch
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate: 'twitch://stream/{username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate:
			'intent://www.twitch.tv/{username}#Intent;package=tv.twitch.android.app;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/,
		deepLinkTemplate: 'twitch://video?id={videoId}',
		extractParams: (url, match) => ({ videoId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/,
		deepLinkTemplate:
			'intent://www.twitch.tv/videos/{videoId}#Intent;package=tv.twitch.android.app;scheme=https;end',
		extractParams: (url, match) => ({ videoId: match[1] })
	},

	// Reddit
	{
		platform: 'iOS',
		urlPattern:
			/^https?:\/\/(?:www\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)\/comments\/([a-zA-Z0-9_]+)\/?/,
		deepLinkTemplate: 'reddit://reddit/r/{subreddit}/comments/{postId}',
		extractParams: (url, match) => ({ subreddit: match[1], postId: match[2] })
	},
	{
		platform: 'Android',
		urlPattern:
			/^https?:\/\/(?:www\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)\/comments\/([a-zA-Z0-9_]+)\/?/,
		deepLinkTemplate:
			'intent://www.reddit.com/r/{subreddit}/comments/{postId}#Intent;package=com.reddit.frontpage;scheme=https;end',
		extractParams: (url, match) => ({ subreddit: match[1], postId: match[2] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/(?:www\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate: 'reddit://reddit/r/{subreddit}',
		extractParams: (url, match) => ({ subreddit: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/(?:www\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)\/?$/,
		deepLinkTemplate:
			'intent://www.reddit.com/r/{subreddit}#Intent;package=com.reddit.frontpage;scheme=https;end',
		extractParams: (url, match) => ({ subreddit: match[1] })
	},

	// Discord
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/discord\.gg\/([a-zA-Z0-9]+)/,
		deepLinkTemplate: 'discord://invite/{inviteCode}',
		extractParams: (url, match) => ({ inviteCode: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/discord\.gg\/([a-zA-Z0-9]+)/,
		deepLinkTemplate:
			'intent://discord.gg/{inviteCode}#Intent;package=com.discord;scheme=https;end',
		extractParams: (url, match) => ({ inviteCode: match[1] })
	},

	// GitHub
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/,
		deepLinkTemplate: 'github://repo/{owner}/{repo}',
		extractParams: (url, match) => ({ owner: match[1], repo: match[2] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/,
		deepLinkTemplate:
			'intent://github.com/{owner}/{repo}#Intent;package=com.github.android;scheme=https;end',
		extractParams: (url, match) => ({ owner: match[1], repo: match[2] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/?$/,
		deepLinkTemplate: 'github://user/{username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/?$/,
		deepLinkTemplate:
			'intent://github.com/{username}#Intent;package=com.github.android;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	},

	// WhatsApp
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/wa\.me\/(\d+)/,
		deepLinkTemplate: 'whatsapp://send?phone={phone}',
		extractParams: (url, match) => ({ phone: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/wa\.me\/(\d+)/,
		deepLinkTemplate: 'intent://send?phone={phone}#Intent;package=com.whatsapp;scheme=whatsapp;end',
		extractParams: (url, match) => ({ phone: match[1] })
	},
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/,
		deepLinkTemplate: 'whatsapp://chat/{groupId}',
		extractParams: (url, match) => ({ groupId: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/,
		deepLinkTemplate:
			'intent://chat.whatsapp.com/{groupId}#Intent;package=com.whatsapp;scheme=https;end',
		extractParams: (url, match) => ({ groupId: match[1] })
	},

	// Telegram
	{
		platform: 'iOS',
		urlPattern: /^https?:\/\/t\.me\/([a-zA-Z0-9_]+)/,
		deepLinkTemplate: 'tg://resolve?domain={username}',
		extractParams: (url, match) => ({ username: match[1] })
	},
	{
		platform: 'Android',
		urlPattern: /^https?:\/\/t\.me\/([a-zA-Z0-9_]+)/,
		deepLinkTemplate:
			'intent://t.me/{username}#Intent;package=org.telegram.messenger;scheme=https;end',
		extractParams: (url, match) => ({ username: match[1] })
	}
];

export function detectPlatform(userAgent: string): 'iOS' | 'Android' | 'Desktop' {
	const ua = userAgent.toLowerCase();

	if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
		return 'iOS';
	}

	if (ua.includes('android')) {
		return 'Android';
	}

	return 'Desktop';
}

export function generateDeepLink(url: string, userAgent: string): string | null {
	const platform = detectPlatform(userAgent);
	if (platform === 'Desktop') {
		return null;
	}

	const cleanUrl = url.split('?')[0];

	for (const pattern of DEEPLINK_PATTERNS) {
		if (pattern.platform !== platform) {
			continue;
		}

		const match = cleanUrl.match(pattern.urlPattern);
		if (match) {
			const params = pattern.extractParams(cleanUrl, match);
			let deepLink = pattern.deepLinkTemplate;

			Object.entries(params).forEach(([key, value]) => {
				deepLink = deepLink.replace(`{${key}}`, value);
			});

			return deepLink;
		}
	}

	return null;
}

export function shouldUseDeepLink(url: string, userAgent: string): boolean {
	return generateDeepLink(url, userAgent) !== null;
}
