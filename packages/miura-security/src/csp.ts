import { CSPDirective, SecurityEvent } from './types.js';

/**
 * Content Security Policy (CSP) service for miura Framework
 * Handles CSP generation, validation, and enforcement
 */
export class CSPService {
  private static instance: CSPService;
  private directives: CSPDirective;
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();

  private constructor() {
    this.directives = this.getDefaultDirectives();
  }

  static getInstance(): CSPService {
    if (!CSPService.instance) {
      CSPService.instance = new CSPService();
    }
    return CSPService.instance;
  }

  /**
   * Generate CSP policy string (for meta or header)
   */
  generateCSPPolicyString({ forMeta = false }: { forMeta?: boolean } = {}): string {
    const directives: string[] = [];
    for (const [directive, sources] of Object.entries(this.directives)) {
      // Skip frame-ancestors for meta tag
      if (forMeta && directive === 'frame-ancestors') continue;
      if (sources !== undefined) {
        if (Array.isArray(sources)) {
          directives.push(`${directive} ${sources.join(' ')}`);
        } else if (typeof sources === 'boolean') {
          if (sources) {
            directives.push(directive);
          }
        }
      }
    }
    return directives.join('; ');
  }

  /**
   * Generate CSP header string (for HTTP header)
   */
  generateCSPHeader(reportOnly: boolean = false): string {
    const header = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    const policy = this.generateCSPPolicyString();
    return `${header}: ${policy}`;
  }

  /**
   * Set CSP directive
   */
  setDirective(directive: keyof CSPDirective, sources: string[] | boolean): void {
    (this.directives as any)[directive] = sources;
  }

  /**
   * Add source to directive
   */
  addSource(directive: keyof CSPDirective, source: string): void {
    const current = this.directives[directive];
    if (Array.isArray(current)) {
      if (!current.includes(source)) {
        current.push(source);
      }
    } else {
      this.setDirective(directive, [source]);
    }
  }

  /**
   * Remove source from directive
   */
  removeSource(directive: keyof CSPDirective, source: string): void {
    const current = this.directives[directive];
    if (Array.isArray(current)) {
      const index = current.indexOf(source);
      if (index > -1) {
        current.splice(index, 1);
      }
    }
  }

  /**
   * Validate CSP directive
   */
  validateDirective(directive: string, sources: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for invalid sources
    const invalidSources = sources.filter(source => {
      return !this.isValidSource(source);
    });
    
    if (invalidSources.length > 0) {
      errors.push(`Invalid sources: ${invalidSources.join(', ')}`);
    }
    
    // Check for unsafe sources
    const unsafeSources = sources.filter(source => {
      return this.isUnsafeSource(source);
    });
    
    if (unsafeSources.length > 0) {
      errors.push(`Unsafe sources detected: ${unsafeSources.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Apply CSP to current page (via <meta> tag)
   */
  applyToPage(reportOnly: boolean = false): void {
    try {
      const policy = this.generateCSPPolicyString({ forMeta: true });
      let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', policy);
      // Log CSP application
      this.emitSecurityEvent('auth_success', 'low', {
        action: 'csp_applied',
        reportOnly,
        directives: Object.keys(this.directives)
      });
    } catch (error) {
      this.emitSecurityEvent('auth_failure', 'medium', {
        reason: 'csp_application_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle CSP violation reports
   */
  handleViolation(violation: any): void {
    this.emitSecurityEvent('xss_attempt', 'high', {
      reason: 'csp_violation',
      directive: violation.violatedDirective,
      blockedUri: violation.blockedURI,
      sourceFile: violation.sourceFile,
      lineNumber: violation.lineNumber
    });
  }

  /**
   * Get current directives
   */
  getDirectives(): CSPDirective {
    return { ...this.directives };
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

  // Private methods

  private getDefaultDirectives(): CSPDirective {
    return {
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
    };
  }

  private isValidSource(source: string): boolean {
    const validPatterns = [
      /^'self'$/,
      /^'unsafe-inline'$/,
      /^'unsafe-eval'$/,
      /^'none'$/,
      /^'strict-dynamic'$/,
      /^https?:\/\/.+/,
      /^data:/,
      /^blob:/,
      /^filesystem:/
    ];
    
    return validPatterns.some(pattern => pattern.test(source));
  }

  private isUnsafeSource(source: string): boolean {
    const unsafePatterns = [
      /^'unsafe-inline'$/,
      /^'unsafe-eval'$/,
      /^data:/,
      /^blob:/
    ];
    
    return unsafePatterns.some(pattern => pattern.test(source));
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
export const csp = CSPService.getInstance(); 