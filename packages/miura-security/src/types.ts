/**
 * Security module types for miura Framework
 */

// Authentication configuration
export interface AuthConfig {
  /** POST endpoint that accepts { email, password } and returns { user, token } */
  loginEndpoint: string;
  /** POST endpoint that accepts { refreshToken } and returns { token } */
  refreshEndpoint?: string;
  /** POST endpoint called on logout (best-effort, receives Authorization header) */
  logoutEndpoint?: string;
  /** Maximum failed login attempts before account lockout */
  maxLoginAttempts: number;
  /** Duration in ms for which a locked account stays locked */
  lockoutDuration: number;
  /** localStorage key prefix for persisting the session */
  storageKey: string;
  /** Additional request headers sent with every auth request */
  headers: Record<string, string>;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  username?: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: 'Bearer' | 'JWT';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Authorization types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
  metadata?: Record<string, any>;
}

// CSP (Content Security Policy) types
export interface CSPDirective {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'font-src'?: string[];
  'object-src'?: string[];
  'media-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
  'require-trusted-types-for'?: string[];
}

// Security headers types
export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  'X-Content-Type-Options'?: 'nosniff';
  'X-XSS-Protection'?: '0' | '1' | '1; mode=block';
  'Referrer-Policy'?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  'Strict-Transport-Security'?: string;
  'Permissions-Policy'?: string;
}

// CSRF protection types
export interface CSRFConfig {
  enabled: boolean;
  tokenName: string;
  headerName: string;
  cookieName: string;
  tokenLength: number;
  expiresIn: number;
}

// Input validation types
export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// Encryption types
export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keyLength: number;
  ivLength: number;
}

// Audit logging types
export interface AuditEvent {
  timestamp: number;
  userId?: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

// Security configuration
export interface SecurityConfig {
  authentication: {
    enabled: boolean;
    /** Partial AuthConfig applied at startup — endpoints, lockout, storage key */
    config?: Partial<AuthConfig>;
  };
  authorization: {
    enabled: boolean;
    defaultRole: string;
    superAdminRole: string;
  };
  csp: {
    enabled: boolean;
    directives: CSPDirective;
    reportOnly: boolean;
    reportUri?: string;
  };
  csrf: CSRFConfig;
  headers: SecurityHeaders;
  validation: {
    enabled: boolean;
    sanitizeInput: boolean;
    encodeOutput: boolean;
  };
  encryption: {
    enabled: boolean;
    config: EncryptionConfig;
  };
  audit: {
    enabled: boolean;
    logLevel: 'info' | 'warn' | 'error';
    maxLogSize: number;
  };
}

// Security events
export interface SecurityEvent {
  type: 'auth_success' | 'auth_failure' | 'permission_denied' | 'csrf_violation' | 'xss_attempt' | 'injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: number;
  userId?: string;
  ipAddress?: string;
}

// Security middleware types
export interface SecurityMiddleware {
  name: string;
  priority: number;
  execute: (context: SecurityContext) => Promise<boolean>;
}

export interface SecurityContext {
  request: Request;
  response?: Response;
  user?: User;
  token?: AuthToken;
  metadata: Record<string, any>;
} 