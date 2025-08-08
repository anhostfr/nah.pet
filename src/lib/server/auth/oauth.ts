export interface AuthConfig {
	url: string;
	clientId: string;
	clientSecret?: string;
	redirectUri?: string;
	scopes?: string[];
}

export interface User {
	id: number;
	google_id?: string;
	discord_id?: string;
	name: string;
	email: string;
	email_verified: boolean;
	avatar_url: string;
}

export interface Session {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	token_type: 'Bearer';
	user: User;
}

export type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export type AuthStateChangeCallback = (event: AuthEvent, session: Session | null) => void;

export interface AuthResponse {
	data: { user: User; session: Session } | null;
	error: Error | null;
}

export class AuthError extends Error {
	constructor(
		message: string,
		public code?: string
	) {
		super(message);
		this.name = 'AuthError';
	}
}

export class AuthClient {
	private config: AuthConfig;
	private session: Session | null = null;
	private listeners: AuthStateChangeCallback[] = [];
	private refreshTimer: NodeJS.Timeout | null = null;

	constructor(config: AuthConfig) {
		this.config = {
			redirectUri: config.redirectUri || '/oauth/callback',
			scopes: ['profile', 'email'],
			...config
		};

		if (typeof window !== 'undefined') {
			this.restoreSession();
			this.setupAutoRefresh();
		}
	}

	/**
	 * Initiate OAuth login flow
	 * @returns Promise containing the authorization URL or error
	 */
	async signInWithOAuth(): Promise<{ data: { url: string } | null; error: Error | null }> {
		try {
			const state = this.generateState();
			const scope = this.config.scopes!.join(' ');

			if (typeof window !== 'undefined') {
				localStorage.setItem('auth_state', state);
			}

			const params = new URLSearchParams({
				client_id: this.config.clientId,
				redirect_uri: this.config.redirectUri!,
				state,
				scope,
				response_type: 'code'
			});

			const authUrl = `${this.config.url}/oauth/authorize?${params}`;

			return { data: { url: authUrl }, error: null };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	/**
	 * Exchange authorization code for session
	 * @param code - Authorization code from OAuth provider
	 * @param state - State parameter for CSRF protection
	 * @returns Promise containing user session or error
	 */
	async exchangeCodeForSession(code: string, state: string): Promise<AuthResponse> {
		try {
			if (typeof window !== 'undefined') {
				const storedState = localStorage.getItem('auth_state');
				if (storedState !== state) {
					throw new AuthError('State mismatch', 'INVALID_STATE');
				}

				localStorage.removeItem('auth_state');
			}

			console.log('OAuth token exchange config:', {
				url: this.config.url,
				clientId: this.config.clientId,
				redirectUri: this.config.redirectUri,
				hasClientSecret: !!this.config.clientSecret
			});

			const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret || ''}`);
			const response = await fetch(`${this.config.url}/oauth/token?code=${code}`, {
				method: 'GET',
				headers: {
					Authorization: `Basic ${credentials}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new AuthError(
					`Failed to exchange code for tokens: ${errorText}`,
					'TOKEN_EXCHANGE_ERROR'
				);
			}

			const tokens = await response.json();

			const userResponse = await fetch(`${this.config.url}/oauth/userinfo`, {
				headers: {
					Authorization: `Bearer ${tokens.access_token}`
				}
			});

			if (!userResponse.ok) {
				throw new AuthError('Failed to fetch user info', 'USER_FETCH_ERROR');
			}

			const user = await userResponse.json();

			const session: Session = {
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				expires_at: Date.now() + tokens.expires_in * 1000,
				token_type: 'Bearer',
				user
			};

			this.setSession(session);
			this.notifyListeners('SIGNED_IN', session);

			return { data: { user, session }, error: null };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	/**
	 * Get current user information
	 * @returns Promise containing user data or error
	 */
	async getUser(): Promise<{ data: { user: User } | null; error: Error | null }> {
		if (!this.session) {
			return { data: null, error: new AuthError('No active session', 'NO_SESSION') };
		}

		try {
			await this.ensureValidSession();

			const response = await fetch(`${this.config.url}/oauth/userinfo`, {
				headers: {
					Authorization: `Bearer ${this.session.access_token}`
				}
			});

			if (!response.ok) {
				throw new AuthError('Failed to fetch user', 'USER_FETCH_ERROR');
			}

			const user = await response.json();

			this.session.user = user;
			this.saveSession();
			this.notifyListeners('USER_UPDATED', this.session);

			return { data: { user }, error: null };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	/**
	 * Get current session
	 * @returns Current session data or error
	 */
	getSession(): { data: { session: Session } | null; error: Error | null } {
		if (!this.session) {
			return { data: null, error: new AuthError('No active session', 'NO_SESSION') };
		}
		return { data: { session: this.session }, error: null };
	}

	/**
	 * Sign out user and revoke tokens
	 * @returns Promise with potential error
	 */
	async signOut(): Promise<{ error: Error | null }> {
		try {
			if (this.session) {
				await fetch(`${this.config.url}/oauth/revoke?token=${this.session.access_token}`, {
					method: 'POST'
				});
				await fetch(`${this.config.url}/oauth/revoke?token=${this.session.refresh_token}`, {
					method: 'POST'
				});
			}

			this.clearSession();
			this.notifyListeners('SIGNED_OUT', null);

			return { error: null };
		} catch (error) {
			this.clearSession();
			this.notifyListeners('SIGNED_OUT', null);
			return { error: error as Error };
		}
	}

	/**
	 * Listen to authentication state changes
	 * @param callback - Function to call when auth state changes
	 * @returns Unsubscribe function
	 */
	onAuthStateChange(callback: AuthStateChangeCallback): () => void {
		this.listeners.push(callback);

		callback(this.session ? 'SIGNED_IN' : 'SIGNED_OUT', this.session);

		return () => {
			const index = this.listeners.indexOf(callback);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	/**
	 * Redirect to authorization URL (web app helper)
	 * @throws Error if unable to redirect
	 */
	async redirectToAuth(): Promise<void> {
		const result = await this.signInWithOAuth();
		if (result.data?.url) {
			window.location.href = result.data.url;
		} else if (result.error) {
			throw result.error;
		}
	}

	private generateState(): string {
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
	}

	private setSession(session: Session) {
		this.session = session;
		this.saveSession();
		this.setupAutoRefresh();
	}

	private clearSession() {
		this.session = null;
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_session');
		}
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
	}

	private saveSession() {
		if (this.session && typeof window !== 'undefined') {
			localStorage.setItem('auth_session', JSON.stringify(this.session));
		}
	}

	private restoreSession() {
		if (typeof window === 'undefined') return;

		try {
			const saved = localStorage.getItem('auth_session');
			if (saved) {
				this.session = JSON.parse(saved);
				this.setupAutoRefresh();
			}
		} catch (error) {
			localStorage.removeItem('auth_session');
		}
	}

	private async ensureValidSession(): Promise<void> {
		if (!this.session) return;

		const now = Date.now();
		const buffer = 5 * 60 * 1000;

		if (now >= this.session.expires_at - buffer) {
			await this.refreshSession();
		}
	}

	private async refreshSession(): Promise<void> {
		if (!this.session) return;

		try {
			const response = await fetch(
				`${this.config.url}/oauth/refresh?refresh_token=${this.session.refresh_token}&access_token=${this.session.access_token}`,
				{ method: 'POST' }
			);

			if (!response.ok) {
				throw new AuthError('Failed to refresh token', 'REFRESH_ERROR');
			}

			const tokens = await response.json();

			this.session = {
				...this.session,
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				expires_at: Date.now() + tokens.expires_in * 1000
			};

			this.saveSession();
			this.setupAutoRefresh();
			this.notifyListeners('TOKEN_REFRESHED', this.session);
		} catch (error) {
			this.clearSession();
			this.notifyListeners('SIGNED_OUT', null);
			throw error;
		}
	}

	private setupAutoRefresh() {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}

		if (!this.session) return;

		const now = Date.now();
		const expiresAt = this.session.expires_at;
		const refreshIn = expiresAt - now - 10 * 60 * 1000;

		if (refreshIn > 0) {
			this.refreshTimer = setTimeout(async () => {
				try {
					await this.refreshSession();
				} catch (error) {
					console.error('Auto refresh failed:', error);
				}
			}, refreshIn);
		}
	}

	private notifyListeners(event: AuthEvent, session: Session | null) {
		this.listeners.forEach((callback) => {
			try {
				callback(event, session);
			} catch (error) {
				console.error('Auth state change listener error:', error);
			}
		});
	}
}

export default AuthClient;

/**
 * Create a new AuthClient instance
 * @param config - OAuth configuration
 * @returns New AuthClient instance
 */
export function createAuthClient(config: AuthConfig): AuthClient {
	return new AuthClient(config);
}
