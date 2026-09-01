//src/components/ProtectedRoute
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role")?.toLowerCase();

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) {
        role = payload.role.toLowerCase();
      }
    } catch (e) {
      console.error("Failed to parse token", e);
    }
  }

  if (!token) {
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
