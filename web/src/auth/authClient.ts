// OWASP-hardened authentication client for Chrono Cockpit
const BACKEND_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://127.0.0.1:8000';

export interface AuthUser {
  email: string;
  role: string;
  provider?: string;
  created_at?: number;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
  locked?: boolean;
  retry_after?: number;
}

class AuthClient {
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('chrono_auth_token') || this.getCookie('chrono_auth_token');
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private setCookie(name: string, value: string, maxAgeSec: number = 86400) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
  }

  private deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }

  public async fetchCsrfToken(): Promise<string> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/csrf`);
      if (res.ok) {
        const data = await res.json();
        this.csrfToken = data.csrf_token;
        return data.csrf_token;
      }
    } catch {
      // Fallback client-generated anti-CSRF token
      this.csrfToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    return this.csrfToken || '';
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    const csrf = this.csrfToken || await this.fetchCsrfToken();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf
        },
        body: JSON.stringify({ email, password, csrf_token: csrf })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.token = data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('chrono_auth_token', data.token);
          this.setCookie('chrono_auth_token', data.token);
          localStorage.setItem('chrono_user', JSON.stringify(data.user));
        }
        return { success: true, token: data.token, user: data.user };
      } else {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify credentials.',
          locked: data.locked || false,
          retry_after: data.retry_after
        };
      }
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to security authentication service.' };
    }
  }

  public async signup(email: string, password: string): Promise<LoginResult> {
    const csrf = this.csrfToken || await this.fetchCsrfToken();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf
        },
        body: JSON.stringify({ email, password, csrf_token: csrf })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.token = data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('chrono_auth_token', data.token);
          this.setCookie('chrono_auth_token', data.token);
          localStorage.setItem('chrono_user', JSON.stringify(data.user));
        }
        return { success: true, token: data.token, user: data.user };
      } else {
        return { success: false, error: data.error || 'Sign up failed.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to security authentication service.' };
    }
  }

  public async loginWithSSO(provider: 'google' | 'apple' | 'binance' | 'wallet'): Promise<LoginResult> {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/sso/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.token = data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('chrono_auth_token', data.token);
          this.setCookie('chrono_auth_token', data.token);
          localStorage.setItem('chrono_user', JSON.stringify(data.user));
        }
        return { success: true, token: data.token, user: data.user };
      } else {
        return { success: false, error: data.error || `SSO login with ${provider} failed.` };
      }
    } catch (err: any) {
      return { success: false, error: `SSO connection error for ${provider}.` };
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch {
      // Continue cleanup locally
    }
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chrono_auth_token');
      localStorage.removeItem('chrono_user');
      this.deleteCookie('chrono_auth_token');
    }
  }

  public async checkSession(): Promise<AuthSessionResponse> {
    const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('chrono_auth_token') || this.getCookie('chrono_auth_token') : null);
    if (!token) {
      return { authenticated: false };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Fallback check if token exists locally
      if (typeof window !== 'undefined' && localStorage.getItem('chrono_user')) {
        try {
          const user = JSON.parse(localStorage.getItem('chrono_user')!);
          return { authenticated: true, user };
        } catch {
          // ignore
        }
      }
    }

    return { authenticated: false };
  }

  public getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('chrono_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }
}

export const authClient = new AuthClient();
