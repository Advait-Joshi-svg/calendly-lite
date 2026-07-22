import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppHeader({ eyebrow, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
      </div>
      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/availability">Availability</Link>
        <Link to="/bookings">Bookings</Link>
        {user?.slug && (
          <Link to={`/book/${user.slug}`} target="_blank" rel="noreferrer">
            Public page
          </Link>
        )}
        <button onClick={handleLogout}>Log out</button>
      </nav>
    </header>
  );
}
