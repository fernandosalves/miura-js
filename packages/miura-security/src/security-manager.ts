import { SecurityConfig, SecurityEvent, SecurityMiddleware } from './types.js';
import { auth } from './authentication.js';
import { authz } from './authorization.js';
import { csp } from './csp.js';
import { validation } from './validation.js';

/**
 * Main security manager for miura Framework
 * Orchestrates all security services and provides a unified interface
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private middlewares: SecurityMiddleware[] = [];
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = this.getDefaultConfig();
    Object.assign(this.config, config);
    this.initializeSecurity();
  }

  static getInstance(config?: Partial<SecurityConfig>): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security features
   */
  private initializeSecurity(): void {
    // Initialize CSP if enabled
    if (this.config.csp.enabled) {
      csp.applyToPage(this.config.csp.reportOnly);
    }

    // Set up security event listeners
    this.setupEventListeners();

    // Apply security headers if in a web context
    if (typeof window !== 'undefined') {
      this.applySecurityHeaders();
    }
  }

  /**
   * Add security middleware
   */
  addMiddleware(middleware: SecurityMiddleware): void {
    this.middlewares.push(middleware);
    // Sort by priority (higher priority first)
    this.middlewares.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove security middleware
   */
  removeMiddleware(name: string): void {
    const index = this.middlewares.findIndex(m => m.name === name);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
  }

  /**
   * Execute security middlewares
   */
  async executeMiddlewares(context: any): Promise<boolean> {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware.execute(context);
        if (!result) {
          // Middleware blocked the request
          this.emitSecurityEvent('permission_denied', 'medium', {
            reason: 'middleware_blocked',
            middleware: middleware.name
          });
          return false;
        }
      } catch (error) {
        this.emitSecurityEvent('auth_failure', 'high', {
          reason: 'middleware_error',
          middleware: middleware.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
      }
    }
    return true;
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    Object.assign(this.config, updates);
    this.initializeSecurity();
  }

  /**
   * Get authentication service
   */
  getAuth() {
    return auth;
  }

  /**
   * Get authorization service
   */
  getAuthz() {
    return authz;
  }

  /**
   * Get CSP service
   */
  getCSP() {
    return csp;
  }

  /**
   * Get validation service
   */
  getValidation() {
    return validation;
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (event: SecurityEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (event: SecurityEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get security status
   */
  getSecurityStatus(): {
    authenticated: boolean;
    user: any;
    permissions: string[];
    cspEnabled: boolean;
    validationEnabled: boolean;
  } {
    return {
      authenticated: auth.isAuthenticated(),
      user: auth.getCurrentUser(),
      permissions: authz.getCurrentUserPermissions(),
      cspEnabled: this.config.csp.enabled,
      validationEnabled: this.config.validation.enabled
    };
  }

  // Private methods

  private getDefaultConfig(): SecurityConfig {
    return {
      authentication: {
        enabled: true,
        config: {
          maxLoginAttempts: 5,
          lockoutDuration: 15 * 60 * 1000 // 15 minutes
        }
      },
      authorization: {
        enabled: true,
        defaultRole: 'user',
        superAdminRole: 'admin'
      },
      csp: {
        enabled: false,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'font-src': ["'self'"],
          'object-src': ["'none'"],
          'media-src': ["'self'"],
          'frame-src': ["'none'"],
          'worker-src': ["'self'"],
          'manifest-src': ["'self'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'upgrade-insecure-requests': true,
          'block-all-mixed-content': true
        },
        reportOnly: false
      },
      csrf: {
        enabled: true,
        tokenName: 'csrf-token',
        headerName: 'X-CSRF-Token',
        cookieName: 'csrf-token',
        tokenLength: 32,
        expiresIn: 60 * 60 * 1000 // 1 hour
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      },
      validation: {
        enabled: true,
        sanitizeInput: true,
        encodeOutput: true
      },
      encryption: {
        enabled: false,
        config: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          ivLength: 12
        }
      },
      audit: {
        enabled: true,
        logLevel: 'info',
        maxLogSize: 1000
      }
    };
  }

  private setupEventListeners(): void {
    // Listen to authentication events
    auth.on('auth_success', (event) => {
      this.emitSecurityEvent('auth_success', event.severity, event.details);
    });

    auth.on('auth_failure', (event) => {
      this.emitSecurityEvent('auth_failure', event.severity, event.details);
    });

    // Listen to authorization events
    authz.on('permission_denied', (event) => {
      this.emitSecurityEvent('permission_denied', event.severity, event.details);
    });

    // Listen to validation events
    validation.on('injection_attempt', (event) => {
      this.emitSecurityEvent('injection_attempt', event.severity, event.details);
    });
  }

  private applySecurityHeaders(): void {
    // Note: In a browser context, you can't directly set HTTP headers
    // This would typically be done on the server side
    // Here we just log what headers should be set
    
    if (this.config.headers) {
      console.log('Security headers that should be set on the server:');
      for (const [header, value] of Object.entries(this.config.headers)) {
        console.log(`${header}: ${value}`);
      }
    }
  }

  private emitSecurityEvent(type: SecurityEvent['type'], severity: SecurityEvent['severity'], details: Record<string, any>): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: Date.now()
    };
    
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => callback(event));
  }
}

// Export singleton instance
export const security = SecurityManager.getInstance(); 