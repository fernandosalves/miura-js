import { ValidationRule, ValidationSchema, SecurityEvent } from './types.js';

/**
 * Input validation and sanitization service for miura Framework
 * Handles XSS prevention, input sanitization, and output encoding
 */
export class ValidationService {
  private static instance: ValidationService;
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate input against schema
   */
  validate(data: any, schema: ValidationSchema): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      for (const rule of rules) {
        const validationResult = this.validateRule(value, rule);
        if (typeof validationResult === 'string') {
          fieldErrors.push(validationResult);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    // Log validation failures
    if (Object.keys(errors).length > 0) {
      this.emitSecurityEvent('injection_attempt', 'medium', {
        reason: 'validation_failed',
        errors,
        data: this.sanitizeForLogging(data)
      });
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potentially dangerous characters and patterns
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '');
  }

  /**
   * Encode output to prevent XSS
   */
  encodeOutput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validate URL format
   */
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): boolean {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      valid: score >= 4,
      score,
      feedback
    };
  }

  /**
   * Check for SQL injection patterns
   */
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(UNION|SELECT)\s+.*\bFROM\b)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
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

  private validateRule(value: any, rule: ValidationRule): boolean | string {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message || 'This field is required';
        }
        break;

      case 'email':
        if (value && !this.validateEmail(value)) {
          return rule.message || 'Invalid email format';
        }
        break;

      case 'url':
        if (value && !this.validateURL(value)) {
          return rule.message || 'Invalid URL format';
        }
        break;

      case 'minLength':
        if (value && typeof value === 'string' && value.length < (rule.value as number)) {
          return rule.message || `Minimum length is ${rule.value} characters`;
        }
        break;

      case 'maxLength':
        if (value && typeof value === 'string' && value.length > (rule.value as number)) {
          return rule.message || `Maximum length is ${rule.value} characters`;
        }
        break;

      case 'pattern':
        if (value && rule.value && !(rule.value as RegExp).test(value)) {
          return rule.message || 'Invalid format';
        }
        break;

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value);
          if (result !== true) {
            return typeof result === 'string' ? result : 'Validation failed';
          }
        }
        break;
    }

    return true;
  }

  private sanitizeForLogging(data: any): any {
    // Remove sensitive fields from logging
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
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
export const validation = ValidationService.getInstance(); 