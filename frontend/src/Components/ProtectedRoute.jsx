import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles, setToken }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role")?.toLowerCase();

  const getLoginRedirect = () => {
    if (location.pathname.startsWith("/manager")) return "/manager/login";
    if (location.pathname.startsWith("/dashboard")) return "/admin/login";
    if (location.pathname.startsWith("/register")) return "/user/login";
    return "/login";
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    if (setToken) setToken(null);
  };

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token has expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          clearAuth();
          return <Navigate to={getLoginRedirect()} state={{ from: location.pathname }} replace />;
        }

        if (payload.role) {
          role = payload.role.toLowerCase();
        }
      } else {
        clearAuth();
        return <Navigate to={getLoginRedirect()} state={{ from: location.pathname }} replace />;
      }
    } catch (e) {
      console.error("Failed to parse token", e);
      clearAuth();
      return <Navigate to={getLoginRedirect()} state={{ from: location.pathname }} replace />;
    }
  }

  if (!token) {
    clearAuth();
    return <Navigate to={getLoginRedirect()} state={{ from: location.pathname }} replace />;
  }

  // if the route is restricted to specific roles and the user's role
  // (from the server-issued JWT, not any client input) isn't in the list,
  // send them somewhere safe instead of rendering a page they shouldn't see
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
