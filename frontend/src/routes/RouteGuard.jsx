import { Navigate } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';

// ==============================|| ROUTE GUARD - RBAC ONLY ||============================== //

/**
 * RouteGuard - RBAC ONLY (No Auth Check)
 * 
 * Enterprise Mode:
 * - Assumes user is ALREADY logged in (router handles that)
 * - ONLY checks role permissions
 * - Frontend UI hints only - backend enforces real security
 * 
 * @param {string[]|null} allowedRoles - Array of allowed role names
 * @param {React.ReactNode} children - Component to render
 */
const RouteGuard = ({ allowedRoles = null, children }) => {
  const { user } = useAuth();

  // If no user, router should have redirected already
  // This is a safety check only
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get user's primary role
  const userRole = user.roles?.[0] || null;

  if (!userRole) {
    return <Navigate to="/403" replace />;
  }

  // SUPER_ADMIN has unrestricted access
  if (userRole === 'SUPER_ADMIN') {
    return children;
  }

  // If no specific roles required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in allowed list
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RouteGuard;
