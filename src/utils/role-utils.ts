/* eslint-disable indent */
// utils/role-utils.ts
export type UserRole = 'interns' | 'staff' | 'admin';

export interface RolePermissions {
  canPostJobs: boolean;
  canApplyToJobs: boolean;
  canManageApplications: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
  canVerifyStaff: boolean;
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
    canVerifyStaff: false,
    canManageAllJobs: false,
  };

  switch (role) {
    case 'interns':
      return {
        ...basePermissions,
        canApplyToJobs: true,
        canViewAnalytics: true,
      };

    case 'staff':
      return {
        ...basePermissions,
        canPostJobs: true,
        canManageApplications: true,
        canViewAnalytics: true,
      };

    case 'admin':
      return {
        canPostJobs: true,
        canApplyToJobs: true, // NITDA can apply to jobs if needed
        canManageApplications: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canAccessAdminPanel: true,
        canManageSystem: true,
        canVerifyStaff: true,
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

// Check if user has staff capabilities
export const hasStaffCapabilities = (role: UserRole): boolean => {
  return role === 'staff' || role === 'admin';
};

// Check if user has admin capabilities
export const hasAdminCapabilities = (role: UserRole): boolean => {
  return role === 'admin';
};
