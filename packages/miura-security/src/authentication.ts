import { User, AuthToken, LoginCredentials, SecurityEvent, AuthConfig } from './types.js';

/**
 * Authentication service for miura Framework.
 *
 * Acts as a client-side session consumer: it calls your server-side auth API,
 * stores the tokens it receives, and manages refresh/expiry locally.
 *
 * Tokens are ALWAYS issued by the server. This service never generates tokens.
 *
 * Configure endpoints via `AuthenticationService.configure()` before first use.
 */
export class AuthenticationService {
  private static instance: AuthenticationService;
  private config: AuthConfig = {
    loginEndpoint: '/api/auth/login',
    refreshEndpoint: '/api/auth/refresh',
    logoutEndpoint: '/api/auth/logout',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    storageKey: 'miura-auth',
    headers: { 'Content-Type': 'application/json' },
  };

  private currentUser: User | null = null;
  private currentToken: AuthToken | null = null;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Configure auth endpoints and behaviour before first use.
   * Call this once at app startup (e.g. in miuraFramework.connectedCallback).
   */
  configure(config: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Login with credentials.
   * Calls `config.loginEndpoint`; the server response must match `AuthLoginResponse`.
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (this.isAccountLocked(credentials.email)) {
        this.emitSecurityEvent('auth_failure', 'high', {
          reason: 'account_locked',
          email: credentials.email,
        });
        return { success: false, error: 'Account temporarily locked due to too many failed attempts' };
      }

      const response = await fetch(this.config.loginEndpoint, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        credentials: 'include',
      });

      if (!response.ok) {
        this.recordFailedAttempt(credentials.email);
        this.emitSecurityEvent('auth_failure', 'medium', {
          reason: 'invalid_credentials',
          status: response.status,
          email: credentials.email,
        });
        const body = await response.json().catch(() => ({}));
        return { success: false, error: body.message ?? 'Invalid credentials' };
      }

      const body: { user: User; token: AuthToken } = await response.json();

      this.currentUser = body.user;
      this.currentToken = body.token;
      this.saveToStorage();
      this.loginAttempts.delete(credentials.email);
      this.scheduleTokenRefresh();

      this.emitSecurityEvent('auth_success', 'low', {
        userId: body.user.id,
        email: body.user.email,
      });

      return { success: true, user: body.user };
    } catch (error) {
      this.emitSecurityEvent('auth_failure', 'high', {
        reason: 'network_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, error: 'Authentication request failed' };
    }
  }

  /**
   * Logout the current user.
   * Notifies the server (best-effort) and clears local session.
   */
  async logout(): Promise<void> {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.currentToken && this.config.logoutEndpoint) {
      await fetch(this.config.logoutEndpoint, {
        method: 'POST',
        headers: {
          ...this.config.headers,
          Authorization: `${this.currentToken.tokenType} ${this.currentToken.accessToken}`,
        },
        credentials: 'include',
      }).catch(() => { /* best-effort */ });
    }

    if (this.currentUser) {
      this.emitSecurityEvent('auth_success', 'low', {
        action: 'logout',
        userId: this.currentUser.id,
      });
    }

    this.currentUser = null;
    this.currentToken = null;
    this.clearStorage();
  }

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * Returns true if the token was successfully refreshed.
   */
  async refreshToken(): Promise<boolean> {
    if (!this.currentToken?.refreshToken || !this.config.refreshEndpoint) {
      return false;
    }

    try {
      const response = await fetch(this.config.refreshEndpoint, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify({ refreshToken: this.currentToken.refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        this.emitSecurityEvent('auth_failure', 'medium', {
          reason: 'token_refresh_rejected',
          status: response.status,
        });
        await this.logout();
        return false;
      }

      const body: { token: AuthToken } = await response.json();
      this.currentToken = body.token;
      this.saveToStorage();
      this.scheduleTokenRefresh();
      return true;
    } catch (error) {
      this.emitSecurityEvent('auth_failure', 'medium', {
        reason: 'token_refresh_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentToken(): AuthToken | null {
    return this.currentToken;
  }

  /**
   * Returns the Bearer token string ready to use in an Authorization header,
   * or null if the session is invalid/expired.
   */
  getBearerToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return `${this.currentToken!.tokenType} ${this.currentToken!.accessToken}`;
  }

  isAuthenticated(): boolean {
    if (!this.currentUser || !this.currentToken) return false;
    if (Date.now() > this.currentToken.expiresAt) {
      this.currentUser = null;
      this.currentToken = null;
      this.clearStorage();
      return false;
    }
    return true;
  }

  on(event: string, callback: (event: SecurityEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (event: SecurityEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }
  }

  // ── Private ────────────────────────────────────────────────────

  private scheduleTokenRefresh(): void {
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    if (!this.currentToken) return;

    const msUntilExpiry = this.currentToken.expiresAt - Date.now();
    const refreshIn = Math.max(msUntilExpiry - 60_000, 0); // 60s before expiry

    this.refreshTimer = setTimeout(() => this.refreshToken(), refreshIn);
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;
    if (attempts.count >= this.config.maxLoginAttempts) {
      if (Date.now() - attempts.lastAttempt < this.config.lockoutDuration) return true;
      this.loginAttempts.delete(email);
    }
    return false;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email) ?? { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(email, attempts);
  }

  private emitSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: Record<string, any>,
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: Date.now(),
      userId: this.currentUser?.id,
    };
    const listeners = this.eventListeners.get(type) ?? [];
    listeners.forEach(cb => cb(event));
  }

  private saveToStorage(): void {
    if (this.currentUser && this.currentToken) {
      localStorage.setItem(
        `${this.config.storageKey}-session`,
        JSON.stringify({ user: this.currentUser, token: this.currentToken }),
      );
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(`${this.config.storageKey}-session`);
      if (!raw) return;
      const { user, token } = JSON.parse(raw) as { user: User; token: AuthToken };
      if (Date.now() > token.expiresAt) {
        this.clearStorage();
        return;
      }
      this.currentUser = user;
      this.currentToken = token;
      this.scheduleTokenRefresh();
    } catch {
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(`${this.config.storageKey}-session`);
  }
}

export const auth = AuthenticationService.getInstance();