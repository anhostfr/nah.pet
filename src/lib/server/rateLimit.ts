type Attempt = { count: number; lastAttempt: number };

const attempts = new Map<string, Attempt>();


const DEFAULT_WINDOW = 60 * 1000; 
const DEFAULT_MAX_ATTEMPTS = 5;

export function isRateLimited(
	key: string, 
	maxAttempts: number = DEFAULT_MAX_ATTEMPTS, 
	windowMs: number = DEFAULT_WINDOW
): boolean {
	const now = Date.now();
	const attempt = attempts.get(key);

	
	if (attempts.size > 10000) {
		cleanupOldAttempts();
	}

	if (attempt) {
		if (now - attempt.lastAttempt > windowMs) {
			attempts.set(key, { count: 1, lastAttempt: now });
			return false;
		}
		if (attempt.count >= maxAttempts) {
			return true;
		}
		attempt.count++;
		attempt.lastAttempt = now;
		attempts.set(key, attempt);
		return false;
	} else {
		attempts.set(key, { count: 1, lastAttempt: now });
		return false;
	}
}

function cleanupOldAttempts(): void {
	const now = Date.now();
	const maxAge = 24 * 60 * 60 * 1000; 

	for (const [key, attempt] of attempts.entries()) {
		if (now - attempt.lastAttempt > maxAge) {
			attempts.delete(key);
		}
	}
}


export function getRateLimitKey(prefix: string, ip: string, userId?: string): string {
	const cleanIp = ip.replace(/[^0-9a-f:.]/gi, ''); 
	return userId ? `${prefix}:${userId}:${cleanIp}` : `${prefix}:${cleanIp}`;
}
