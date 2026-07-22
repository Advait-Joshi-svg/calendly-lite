import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "checking") {
    return <div className="state-block">Loading…</div>;
  }

  if (status === "signedOut") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
