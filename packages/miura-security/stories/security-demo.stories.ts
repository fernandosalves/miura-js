import type { Meta, StoryObj } from '@storybook/web-components';
import { security, auth, authz, validation, csp, SecurityManager } from '../';

const meta: Meta = {
  title: 'miura-security/Security Demo',
  parameters: {
    docs: {
      description: {
        component: `
# miura Security Module Demo

This story demonstrates all the security features available in the miura Security module:

## 🔐 Authentication
- JWT-based authentication with session management
- Login/logout functionality
- Session persistence

## 🔑 Authorization
- Role-based access control (RBAC)
- Permission checking
- Role management

## 🛡️ Content Security Policy (CSP)
- XSS prevention
- Resource control
- Violation reporting

## ✅ Input Validation
- XSS detection and prevention
- SQL injection detection
- Input sanitization
- Output encoding

## 🔧 Security Manager
- Unified security interface
- Event monitoring
- Middleware system

## Usage Examples

\`\`\`typescript
import { security, auth, authz, validation } from '@miurajsjs/miura-security';

// Initialize security
const securityManager = security.getInstance({
  authentication: { enabled: true },
  csp: { enabled: true },
  validation: { enabled: true }
});

// Authentication
await auth.login(credentials);

// Authorization
if (authz.can('posts', 'create')) {
  // User can create posts
}

// Validation
const result = validation.validate(data, schema);
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj;

// Mock user data for demo
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    roles: ['admin'],
    permissions: ['*:*']
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    roles: ['user'],
    permissions: ['posts:read', 'posts:create']
  },
  {
    id: '3',
    email: 'moderator@example.com',
    password: 'mod123',
    roles: ['moderator'],
    permissions: ['posts:read', 'posts:update', 'comments:moderate']
  }
];

// Security demo component
class SecurityDemo extends HTMLElement {
  private currentUser: any = null;
  private securityEvents: any[] = [];
  private testInput = '';
  private validationResult: any = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupSecurityListeners();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private setupSecurityListeners() {
    // Listen to all security events
    security.on('auth_success', (event) => {
      this.addSecurityEvent('Authentication Success', event);
    });

    security.on('auth_failure', (event) => {
      this.addSecurityEvent('Authentication Failure', event);
    });

    security.on('permission_denied', (event) => {
      this.addSecurityEvent('Permission Denied', event);
    });

    security.on('xss_attempt', (event) => {
      this.addSecurityEvent('XSS Attempt Detected', event);
    });

    security.on('injection_attempt', (event) => {
      this.addSecurityEvent('Injection Attempt Detected', event);
    });
  }

  private setupEventListeners() {
    this.shadowRoot!.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.matches('[data-action="login"]')) {
        this.handleLogin();
      } else if (target.matches('[data-action="logout"]')) {
        this.handleLogout();
      } else if (target.matches('[data-action="test-permission"]')) {
        this.testPermission();
      } else if (target.matches('[data-action="test-validation"]')) {
        this.testValidation();
      } else if (target.matches('[data-action="test-xss"]')) {
        this.testXSS();
      } else if (target.matches('[data-action="apply-csp"]')) {
        this.applyCSP();
      } else if (target.matches('[data-action="clear-events"]')) {
        this.clearEvents();
      }
    });

    // Handle input changes
    this.shadowRoot!.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.name === 'testInput') {
        this.testInput = target.value;
      }
    });
  }

  private async handleLogin() {
    const emailInput = this.shadowRoot!.querySelector('[name="email"]') as HTMLInputElement;
    const passwordInput = this.shadowRoot!.querySelector('[name="password"]') as HTMLInputElement;
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Find mock user
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const result = await auth.login({ email, password });
      if (result.success) {
        this.currentUser = result.user;
        this.addSecurityEvent('Login Successful', { user: result.user });
      }
    } else {
      this.addSecurityEvent('Login Failed', { email, reason: 'Invalid credentials' });
    }
    
    this.render();
  }

  private handleLogout() {
    auth.logout();
    this.currentUser = null;
    this.addSecurityEvent('Logout', {});
    this.render();
  }

  private testPermission() {
    if (!this.currentUser) {
      this.addSecurityEvent('Permission Test Failed', { reason: 'No user logged in' });
      return;
    }

    const permissions = [
      { resource: 'posts', action: 'create' },
      { resource: 'users', action: 'delete' },
      { resource: 'admin', action: 'access' }
    ];

    permissions.forEach(permission => {
      const hasPermission = authz.can(permission.resource, permission.action);
      this.addSecurityEvent(
        hasPermission ? 'Permission Granted' : 'Permission Denied',
        { permission, user: this.currentUser }
      );
    });
  }

  private testValidation() {
    const testData = {
      email: 'test@example.com',
      password: 'weak',
      age: '15',
      bio: '<script>alert("xss")</script>Hello World'
    };

    const schema = {
      email: [
        { type: 'required' as const, message: 'Email is required' },
        { type: 'email' as const, message: 'Invalid email format' }
      ],
      password: [
        { type: 'required' as const, message: 'Password is required' },
        { type: 'minLength' as const, value: 8, message: 'Password must be at least 8 characters' }
      ],
      age: [
        { type: 'custom' as const, validator: (value: string) => {
          const age = parseInt(value);
          return age >= 18 ? true : 'Must be 18 or older';
        }}
      ]
    };

    this.validationResult = validation.validate(testData, schema);
    
    // Test sanitization
    const sanitizedBio = validation.sanitizeInput(testData.bio);
    const encodedBio = validation.encodeOutput(testData.bio);
    
    this.addSecurityEvent('Validation Test', {
      original: testData,
      validationResult: this.validationResult,
      sanitized: sanitizedBio,
      encoded: encodedBio
    });
    
    this.render();
  }

  private testXSS() {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      'SELECT * FROM users WHERE id = 1; DROP TABLE users;'
    ];

    xssPayloads.forEach(payload => {
      const isXSS = validation.detectXSS(payload);
      const isSQLInjection = validation.detectSQLInjection(payload);
      
      if (isXSS) {
        this.addSecurityEvent('XSS Attempt Detected', { payload, type: 'xss' });
      }
      
      if (isSQLInjection) {
        this.addSecurityEvent('SQL Injection Attempt Detected', { payload, type: 'sql' });
      }
    });
  }

  private applyCSP() {
    csp.applyToPage();
    this.addSecurityEvent('CSP Applied', { 
      directives: Object.keys(csp.getDirectives()),
      header: csp.generateCSPHeader()
    });
  }

  private clearEvents() {
    this.securityEvents = [];
    this.render();
  }

  private addSecurityEvent(type: string, details: any) {
    this.securityEvents.unshift({
      type,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 events
    if (this.securityEvents.length > 10) {
      this.securityEvents = this.securityEvents.slice(0, 10);
    }
  }

  private render() {
    const status = security.getSecurityStatus();
    
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        
        .section h2 {
          margin-top: 0;
          color: #495057;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #495057;
        }
        
        input, textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 8px;
          margin-bottom: 8px;
        }
        
        button:hover {
          background: #0056b3;
        }
        
        button.secondary {
          background: #6c757d;
        }
        
        button.secondary:hover {
          background: #545b62;
        }
        
        button.danger {
          background: #dc3545;
        }
        
        button.danger:hover {
          background: #c82333;
        }
        
        .status {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .status.error {
          background: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }
        
        .status.warning {
          background: #fff3cd;
          border-color: #ffeaa7;
          color: #856404;
        }
        
        .events {
          max-height: 300px;
          overflow-y: auto;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
        }
        
        .event {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .event.error {
          border-left-color: #dc3545;
        }
        
        .event.warning {
          border-left-color: #ffc107;
        }
        
        .event.success {
          border-left-color: #28a745;
        }
        
        .event-time {
          color: #6c757d;
          font-size: 11px;
        }
        
        .validation-result {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .validation-error {
          color: #dc3545;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .validation-success {
          color: #28a745;
          font-size: 12px;
        }
        
        .user-info {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .permissions {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }
        
        .permission {
          background: #007bff;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
        }
      </style>
      
      <div class="container">
        <div class="section">
          <h2>🔐 Authentication</h2>
          
          ${this.currentUser ? `
            <div class="user-info">
              <strong>Logged in as:</strong> ${this.currentUser.email}<br>
              <strong>Roles:</strong> ${this.currentUser.roles.join(', ')}<br>
              <strong>Permissions:</strong>
              <div class="permissions">
                ${this.currentUser.permissions.map((p: string) => 
                  `<span class="permission">${p}</span>`
                ).join('')}
              </div>
            </div>
            <button data-action="logout" class="danger">Logout</button>
          ` : `
            <div class="form-group">
              <label>Email:</label>
              <input type="email" name="email" placeholder="admin@example.com">
            </div>
            <div class="form-group">
              <label>Password:</label>
              <input type="password" name="password" placeholder="admin123">
            </div>
            <button data-action="login">Login</button>
            <div style="font-size: 12px; color: #6c757d; margin-top: 10px;">
              <strong>Demo accounts:</strong><br>
              admin@example.com / admin123 (Admin)<br>
              user@example.com / user123 (User)<br>
              moderator@example.com / mod123 (Moderator)
            </div>
          `}
        </div>
        
        <div class="section">
          <h2>🔑 Authorization</h2>
          <button data-action="test-permission">Test Permissions</button>
          <div style="font-size: 12px; color: #6c757d; margin-top: 10px;">
            Tests permissions for posts:create, users:delete, and admin:access
          </div>
        </div>
        
        <div class="section">
          <h2>✅ Input Validation</h2>
          <div class="form-group">
            <label>Test Input:</label>
            <textarea name="testInput" rows="3" placeholder="Enter text to test validation..."></textarea>
          </div>
          <button data-action="test-validation">Test Validation</button>
          <button data-action="test-xss">Test XSS Detection</button>
          
          ${this.validationResult ? `
            <div class="validation-result">
              <strong>Validation Result:</strong><br>
              ${this.validationResult.valid ? 
                '<div class="validation-success">✅ All validations passed</div>' :
                Object.entries(this.validationResult.errors).map(([field, errors]) => 
                  (errors as string[]).map((error: string) => 
                    `<div class="validation-error">❌ ${field}: ${error}</div>`
                  ).join('')
                ).join('')
              }
            </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>🛡️ Content Security Policy</h2>
          <button data-action="apply-csp">Apply CSP</button>
          <div style="font-size: 12px; color: #6c757d; margin-top: 10px;">
            Applies Content Security Policy to prevent XSS attacks
          </div>
        </div>
        
        <div class="section" style="grid-column: 1 / -1;">
          <h2>🔍 Security Events</h2>
          <button data-action="clear-events" class="secondary">Clear Events</button>
          <div class="events">
            ${this.securityEvents.length === 0 ? 
              '<div style="color: #6c757d; text-align: center; padding: 20px;">No security events yet</div>' :
              this.securityEvents.map(event => `
                <div class="event ${this.getEventClass(event.type)}">
                  <div class="event-time">${event.timestamp}</div>
                  <strong>${event.type}</strong><br>
                  <pre style="font-size: 11px; margin: 5px 0 0 0; white-space: pre-wrap;">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
              `).join('')
            }
          </div>
        </div>
        
        <div class="section" style="grid-column: 1 / -1;">
          <h2>📊 Security Status</h2>
          <div class="status ${status.authenticated ? '' : 'warning'}">
            <strong>Authentication:</strong> ${status.authenticated ? '✅ Authenticated' : '❌ Not authenticated'}<br>
            <strong>CSP Enabled:</strong> ${status.cspEnabled ? '✅ Enabled' : '❌ Disabled'}<br>
            <strong>Validation Enabled:</strong> ${status.validationEnabled ? '✅ Enabled' : '❌ Disabled'}<br>
            <strong>User Permissions:</strong> ${status.permissions.length} permissions
          </div>
        </div>
      </div>
    `;
  }

  private getEventClass(type: string): string {
    if (type.includes('Failure') || type.includes('Denied') || type.includes('Attempt')) {
      return 'error';
    } else if (type.includes('Success') || type.includes('Granted')) {
      return 'success';
    } else {
      return 'warning';
    }
  }
}

customElements.define('security-demo', SecurityDemo);

export const Default: Story = {
  render: () => `
    <security-demo></security-demo>
  `
};

export const WithInitialSecurity: Story = {
  render: () => `
    <security-demo></security-demo>
  `,
  play: async () => {
    // Initialize security with custom configuration
    SecurityManager.getInstance({
      authentication: {
        enabled: true,
        jwtSecret: 'demo-secret-key',
        jwtExpiresIn: 24 * 60 * 60 * 1000,
        refreshTokenExpiresIn: 7 * 24 * 60 * 60 * 1000,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000
      },
      csp: {
        enabled: true,
        reportOnly: false,
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
        }
      },
      validation: {
        enabled: true,
        sanitizeInput: true,
        encodeOutput: true
      }
    });
  }
}; 