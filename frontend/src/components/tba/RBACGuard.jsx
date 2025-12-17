import PropTypes from 'prop-types';
import useAuth from 'hooks/useAuth';

// ==============================|| RBAC GUARD - PERMISSION-BASED ACCESS CONTROL ||============================== //

/**
 * RBACGuard - Controls visibility based on user roles and permissions
 * 
 * Usage:
 * <RBACGuard requiredPermissions={['CREATE_EMPLOYER']}>
 *   <Button>Add Employer</Button>
 * </RBACGuard>
 * 
 * <RBACGuard requiredRoles={['ADMIN', 'REVIEW']}>
 *   <AdminPanel />
 * </RBACGuard>
 */
export default function RBACGuard({ 
  requiredRoles = [], 
  requiredPermissions = [], 
  requireAll = false,
  fallback = null,
  children 
}) {
  const { user } = useAuth();

  // If no user, deny access
  if (!user) {
    return fallback;
  }

  const userRoles = user.roles || [];
  const userPermissions = user.permissions || [];

  // Check role requirements
  const hasRequiredRole = requiredRoles.length === 0 || 
    (requireAll 
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role))
    );

  // Check permission requirements
  const hasRequiredPermission = requiredPermissions.length === 0 || 
    (requireAll 
      ? requiredPermissions.every(perm => userPermissions.includes(perm))
      : requiredPermissions.some(perm => userPermissions.includes(perm))
    );

  // Grant access if both checks pass
  const hasAccess = hasRequiredRole && hasRequiredPermission;

  return hasAccess ? children : fallback;
}

RBACGuard.propTypes = {
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  fallback: PropTypes.node,
  children: PropTypes.node
};
