import { User, Permission, Role, SecurityEvent } from './types.js';
import { auth } from './authentication.js';

/**
 * Authorization service for miura Framework
 * Handles role-based access control (RBAC) and permission checking
 */
export class AuthorizationService {
  private static instance: AuthorizationService;
  private roles: Map<string, Role> = new Map();
  private eventListeners: Map<string, ((event: SecurityEvent) => void)[]> = new Map();

  private constructor() {
    this.initializeDefaultRoles();
  }

  static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  /**
   * Check if user has permission for a specific resource and action
   */
  hasPermission(user: User, resource: string, action: string, conditions?: Record<string, any>): boolean {
    try {
      // Check if user has the permission directly
      if (user.permissions.includes(`${resource}:${action}`)) {
        return true;
      }

      // Check permissions through roles
      for (const roleName of user.roles) {
        const role = this.roles.get(roleName);
        if (role) {
          const hasPermission = role.permissions.some(permission => {
            const matchesResource = permission.resource === resource || permission.resource === '*';
            const matchesAction = permission.action === action || permission.action === '*';
            
            if (matchesResource && matchesAction) {
              // Check conditions if provided
              if (conditions && permission.conditions) {
                return this.evaluateConditions(permission.conditions, conditions);
              }
              return true;
            }
            
            return false;
          });

          if (hasPermission) {
            return true;
          }
        }
      }

      // Log permission denied event
      this.emitSecurityEvent('permission_denied', 'medium', {
        userId: user.id,
        resource,
        action,
        userRoles: user.roles,
        userPermissions: user.permissions
      });

      return false;
    } catch (error) {
      this.emitSecurityEvent('permission_denied', 'high', {
        reason: 'authorization_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id,
        resource,
        action
      });
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  hasRole(user: User, roles: string | string[]): boolean {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some(role => user.roles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: User, roles: string[]): boolean {
    return roles.every(role => user.roles.includes(role));
  }

  /**
   * Add a new role
   */
  addRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  /**
   * Remove a role
   */
  removeRole(roleName: string): void {
    this.roles.delete(roleName);
  }

  /**
   * Get all roles
   */
  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role by name
   */
  getRole(roleName: string): Role | undefined {
    return this.roles.get(roleName);
  }

  /**
   * Get current user's permissions
   */
  getCurrentUserPermissions(): string[] {
    const user = auth.getCurrentUser();
    if (!user) return [];
    
    const permissions = new Set<string>(user.permissions);
    
    // Add permissions from roles
    for (const roleName of user.roles) {
      const role = this.roles.get(roleName);
      if (role) {
        role.permissions.forEach(permission => {
          permissions.add(`${permission.resource}:${permission.action}`);
        });
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Check if current user has permission
   */
  can(resource: string, action: string, conditions?: Record<string, any>): boolean {
    const user = auth.getCurrentUser();
    if (!user) return false;
    
    return this.hasPermission(user, resource, action, conditions);
  }

  /**
   * Check if current user has role
   */
  is(roles: string | string[]): boolean {
    const user = auth.getCurrentUser();
    if (!user) return false;
    
    return this.hasRole(user, roles);
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

  private initializeDefaultRoles(): void {
    // Admin role with all permissions
    this.addRole({
      name: 'admin',
      permissions: [
        { resource: '*', action: '*' }
      ],
      metadata: { description: 'Full system access' }
    });

    // User role with basic permissions
    this.addRole({
      name: 'user',
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'posts', action: 'read' },
        { resource: 'posts', action: 'create' },
        { resource: 'posts', action: 'update', conditions: { owner: true } },
        { resource: 'posts', action: 'delete', conditions: { owner: true } }
      ],
      metadata: { description: 'Standard user access' }
    });

    // Moderator role
    this.addRole({
      name: 'moderator',
      permissions: [
        { resource: 'posts', action: 'read' },
        { resource: 'posts', action: 'update' },
        { resource: 'posts', action: 'delete' },
        { resource: 'comments', action: 'read' },
        { resource: 'comments', action: 'update' },
        { resource: 'comments', action: 'delete' },
        { resource: 'users', action: 'read' }
      ],
      metadata: { description: 'Content moderation access' }
    });

    // Guest role with read-only access
    this.addRole({
      name: 'guest',
      permissions: [
        { resource: 'posts', action: 'read' },
        { resource: 'comments', action: 'read' }
      ],
      metadata: { description: 'Read-only access' }
    });
  }

  private evaluateConditions(permissionConditions: Record<string, any>, userConditions: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(permissionConditions)) {
      if (key === 'owner') {
        // Check if user is the owner of the resource
        if (value === true && !userConditions.owner) {
          return false;
        }
      } else if (key === 'organization') {
        // Check if user belongs to the same organization
        if (value !== userConditions.organization) {
          return false;
        }
      } else if (key === 'time') {
        // Check time-based conditions
        const now = Date.now();
        if (value.before && now > value.before) {
          return false;
        }
        if (value.after && now < value.after) {
          return false;
        }
      }
    }
    
    return true;
  }

  private emitSecurityEvent(type: SecurityEvent['type'], severity: SecurityEvent['severity'], details: Record<string, any>): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: Date.now(),
      userId: auth.getCurrentUser()?.id
    };
    
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => callback(event));
  }
}

// Export singleton instance
export const authz = AuthorizationService.getInstance(); 