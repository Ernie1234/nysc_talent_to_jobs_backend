/* eslint-disable indent */
// utils/role-utils.ts
export type UserRole = 'corps_member' | 'employer' | 'nitda';

export interface RolePermissions {
  canPostJobs: boolean;
  canApplyToJobs: boolean;
  canManageApplications: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
  canVerifyEmployers: boolean;
  canManageAllJobs: boolean;
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  const basePermissions: RolePermissions = {
    canPostJobs: false,
    canApplyToJobs: false,
    canManageApplications: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
    canManageSystem: false,
    canVerifyEmployers: false,
    canManageAllJobs: false,
  };

  switch (role) {
    case 'corps_member':
      return {
        ...basePermissions,
        canApplyToJobs: true,
        canViewAnalytics: true,
      };

    case 'employer':
      return {
        ...basePermissions,
        canPostJobs: true,
        canManageApplications: true,
        canViewAnalytics: true,
      };

    case 'nitda':
      return {
        canPostJobs: true,
        canApplyToJobs: true, // NITDA can apply to jobs if needed
        canManageApplications: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canAccessAdminPanel: true,
        canManageSystem: true,
        canVerifyEmployers: true,
        canManageAllJobs: true, // Can manage all jobs in the system
      };

    default:
      return basePermissions;
  }
};

export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  const permissions = getRolePermissions(role);
  return permissions[permission];
};

// Check if user has employer capabilities
export const hasEmployerCapabilities = (role: UserRole): boolean => {
  return role === 'employer' || role === 'nitda';
};

// Check if user has admin capabilities
export const hasAdminCapabilities = (role: UserRole): boolean => {
  return role === 'nitda';
};
