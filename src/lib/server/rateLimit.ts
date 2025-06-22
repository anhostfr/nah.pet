type Attempt = { count: number; lastAttempt: number };

const attempts = new Map<string, Attempt>();
const WINDOW = 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isRateLimited(key: string): boolean {
	const now = Date.now();
	const attempt = attempts.get(key);

	if (attempt) {
		if (now - attempt.lastAttempt > WINDOW) {
			attempts.set(key, { count: 1, lastAttempt: now });
			return false;
		}
		if (attempt.count >= MAX_ATTEMPTS) {
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
