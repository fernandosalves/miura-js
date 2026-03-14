# @miura/miura-security

Comprehensive security module for miura Framework with enterprise-grade security features.

## 🛡️ Features

- **🔐 Authentication** - JWT-based authentication with session management
- **🔑 Authorization** - Role-based access control (RBAC) with fine-grained permissions
- **🛡️ Content Security Policy (CSP)** - XSS prevention and resource control
- **✅ Input Validation** - XSS and injection prevention with sanitization
- **🔒 CSRF Protection** - Cross-site request forgery protection
- **📊 Security Headers** - Comprehensive HTTP security headers
- **🔍 Audit Logging** - Security event tracking and monitoring
- **🔧 Middleware System** - Extensible security middleware architecture

## 🚀 Quick Start

```typescript
import { security, auth, authz, validation } from '@miura/miura-security';

// Initialize security with custom configuration
const securityManager = security.getInstance({
  authentication: {
    enabled: true,
    jwtSecret: 'your-secret-key',
    jwtExpiresIn: 24 * 60 * 60 * 1000 // 24 hours
  },
  csp: {
    enabled: true,
    reportOnly: false
  }
});

// Login user
const result = await auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check permissions
if (authz.can('posts', 'create')) {
  // User can create posts
}

// Validate input
const validationResult = validation.validate(data, schema);
```

## 🔐 Authentication

### Basic Usage

```typescript
import { auth } from '@miura/miura-security';

// Login
const result = await auth.login({
  email: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  console.log('Logged in as:', result.user);
} else {
  console.error('Login failed:', result.error);
}

// Check authentication status
if (auth.isAuthenticated()) {
  const user = auth.getCurrentUser();
  console.log('Current user:', user);
}

// Logout
auth.logout();
```

### Event Handling

```typescript
// Listen to authentication events
auth.on('auth_success', (event) => {
  console.log('Authentication successful:', event.details);
});

auth.on('auth_failure', (event) => {
  console.error('Authentication failed:', event.details);
});
```

## 🔑 Authorization

### Role-Based Access Control

```typescript
import { authz } from '@miura/miura-security';

// Check permissions
if (authz.can('posts', 'create')) {
  // User can create posts
}

if (authz.can('users', 'delete', { admin: true })) {
  // User can delete users if they're an admin
}

// Check roles
if (authz.is(['admin', 'moderator'])) {
  // User has admin or moderator role
}

if (authz.is('admin')) {
  // User has admin role
}

// Get current user permissions
const permissions = authz.getCurrentUserPermissions();
console.log('User permissions:', permissions);
```

### Custom Roles and Permissions

```typescript
import { authz, Role, Permission } from '@miura/miura-security';

// Create custom role
const editorRole: Role = {
  name: 'editor',
  permissions: [
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'create' },
    { resource: 'posts', action: 'update' },
    { resource: 'comments', action: 'moderate' }
  ],
  metadata: { description: 'Content editor access' }
};

authz.addRole(editorRole);
```

## 🛡️ Content Security Policy (CSP)

### Basic Usage

```typescript
import { csp } from '@miura/miura-security';

// Apply CSP to current page
csp.applyToPage();

// Customize CSP directives
csp.setDirective('script-src', ["'self'", "'unsafe-inline'", 'https://cdn.example.com']);
csp.addSource('img-src', 'https://images.example.com');

// Generate CSP header for server
const header = csp.generateCSPHeader();
console.log('CSP Header:', header);
```

### CSP Violation Handling

```typescript
// Handle CSP violations
csp.on('xss_attempt', (event) => {
  console.error('CSP violation detected:', event.details);
  // Report to security monitoring service
});
```

## ✅ Input Validation

### Basic Validation

```typescript
import { validation, ValidationSchema } from '@miura/miura-security';

// Define validation schema
const userSchema: ValidationSchema = {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ],
  password: [
    { type: 'required', message: 'Password is required' },
    { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
    { type: 'pattern', value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase, and number' }
  ],
  age: [
    { type: 'custom', validator: (value) => {
      const age = parseInt(value);
      return age >= 13 && age <= 120 ? true : 'Age must be between 13 and 120';
    }}
  ]
};

// Validate data
const data = {
  email: 'user@example.com',
  password: 'Password123',
  age: '25'
};

const result = validation.validate(data, userSchema);

if (result.valid) {
  console.log('Validation passed');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Input Sanitization

```typescript
// Sanitize user input
const userInput = '<script>alert("xss")</script>Hello World';
const sanitized = validation.sanitizeInput(userInput);
console.log(sanitized); // "Hello World"

// Encode output
const output = validation.encodeOutput('<strong>Bold text</strong>');
console.log(output); // "&lt;strong&gt;Bold text&lt;/strong&gt;"
```

### Security Detection

```typescript
// Detect XSS attempts
if (validation.detectXSS(userInput)) {
  console.warn('XSS attempt detected');
}

// Detect SQL injection
if (validation.detectSQLInjection(userInput)) {
  console.warn('SQL injection attempt detected');
}
```

## 🔧 Security Manager

### Unified Security Interface

```typescript
import { security } from '@miura/miura-security';

// Get security status
const status = security.getSecurityStatus();
console.log('Security status:', status);

// Add custom middleware
security.addMiddleware({
  name: 'rate-limiting',
  priority: 10,
  execute: async (context) => {
    // Implement rate limiting logic
    return true; // Allow request
  }
});

// Listen to security events
security.on('auth_failure', (event) => {
  console.error('Security event:', event);
});
```

### Custom Configuration

```typescript
import { security, SecurityConfig } from '@miura/miura-security';

const config: Partial<SecurityConfig> = {
  authentication: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    jwtExpiresIn: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000 // 30 minutes
  },
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'https:'],
      'connect-src': ["'self'", 'https://api.example.com']
    },
    reportOnly: false
  },
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

const securityManager = security.getInstance(config);
```

## 🔒 CSRF Protection

### Basic CSRF Protection

```typescript
import { security } from '@miura/miura-security';

// CSRF protection is automatically enabled
// The framework will:
// 1. Generate CSRF tokens
// 2. Validate tokens on requests
// 3. Block requests with invalid tokens
```

## 📊 Audit Logging

### Security Event Monitoring

```typescript
import { security } from '@miura/miura-security';

// Listen to all security events
security.on('auth_success', (event) => {
  console.log('Authentication successful:', event);
});

security.on('auth_failure', (event) => {
  console.error('Authentication failed:', event);
});

security.on('permission_denied', (event) => {
  console.warn('Permission denied:', event);
});

security.on('xss_attempt', (event) => {
  console.error('XSS attempt detected:', event);
});

security.on('injection_attempt', (event) => {
  console.error('Injection attempt detected:', event);
});
```

## 🔧 Integration with miura Framework

### Framework Integration

```typescript
import { miuraFramework } from '@miura/miura-framework';
import { security } from '@miura/miura-security';

class SecureApp extends miuraFramework {
  static tagName = 'secure-app';
  
  static config = {
    appName: 'SecureApp',
    security: {
      enabled: true,
      // Security configuration
    }
  };
  
  async connectedCallback() {
    await super.connectedCallback();
    
    // Initialize security
    security.getInstance({
      authentication: { enabled: true },
      csp: { enabled: true },
      validation: { enabled: true }
    });
  }
}
```

### Component-Level Security

```typescript
import { MiuraElement, html } from '@miura/miura-element';
import { authz, validation } from '@miura/miura-security';

class SecureComponent extends MiuraElement {
  static properties = {
    data: { type: Object }
  };
  
  render() {
    // Check permissions before rendering
    if (!authz.can('data', 'read')) {
      return html`<p>Access denied</p>`;
    }
    
    // Sanitize data before rendering
    const sanitizedData = validation.sanitizeInput(this.data);
    
    return html`
      <div>
        <h1>Secure Content</h1>
        <p>${sanitizedData}</p>
      </div>
    `;
  }
}
```

## 🛡️ Security Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const sanitizedInput = validation.sanitizeInput(userInput);
const result = validation.validate(data, schema);

// ❌ Bad
const rawInput = userInput; // Never trust user input
```

### 2. Use Principle of Least Privilege

```typescript
// ✅ Good
if (authz.can('posts', 'update', { owner: true })) {
  // Only allow if user owns the post
}

// ❌ Bad
if (authz.is('user')) {
  // Too broad permission
}
```

### 3. Enable CSP

```typescript
// ✅ Good
csp.applyToPage();
csp.setDirective('script-src', ["'self'"]);

// ❌ Bad
csp.setDirective('script-src', ["'unsafe-inline'", "'unsafe-eval'"]);
```

### 4. Monitor Security Events

```typescript
// ✅ Good
security.on('auth_failure', (event) => {
  // Log and alert on repeated failures
  if (event.details.attempts > 5) {
    alertSecurityTeam(event);
  }
});
```

## 🔧 Configuration Reference

### SecurityConfig Interface

```typescript
interface SecurityConfig {
  authentication: {
    enabled: boolean;
    jwtSecret: string;
    jwtExpiresIn: number;
    refreshTokenExpiresIn: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
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
```

## 🚀 Getting Started

1. **Install the package:**
   ```bash
   npm install @miura/miura-security
   ```

2. **Import and initialize:**
   ```typescript
   import { security } from '@miura/miura-security';
   
   const securityManager = security.getInstance({
     authentication: { enabled: true },
     csp: { enabled: true }
   });
   ```

3. **Start using security features:**
   ```typescript
   import { auth, authz, validation } from '@miura/miura-security';
   
   // Authentication
   await auth.login(credentials);
   
   // Authorization
   if (authz.can('resource', 'action')) {
     // Perform action
   }
   
   // Validation
   const result = validation.validate(data, schema);
   ```

## 📚 API Reference

See the [API documentation](./docs/api.md) for detailed information about all available methods and interfaces.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](../../CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
