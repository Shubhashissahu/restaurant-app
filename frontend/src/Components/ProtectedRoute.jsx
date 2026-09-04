//src/components/ProtectedRoute
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles, setToken }) {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role")?.toLowerCase();

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token has expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          if (setToken) setToken(null);
          return <Navigate to="/login" replace />;
        }

        if (payload.role) {
          role = payload.role.toLowerCase();
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        if (setToken) setToken(null);
        return <Navigate to="/login" replace />;
      }
    } catch (e) {
      console.error("Failed to parse token", e);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      if (setToken) setToken(null);
      return <Navigate to="/login" replace />;
    }
  }

  if (!token) {
    if (setToken) setToken(null);
    return <Navigate to="/login" replace />;
  }

  // if the route is restricted to specific roles and the user's role
  // (from the server-issued JWT, not any client input) isn't in the list,
  // send them somewhere safe instead of rendering a page they shouldn't see
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
