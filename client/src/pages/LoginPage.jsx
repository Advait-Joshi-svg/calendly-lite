import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/apiClient";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-shell narrow">
        <header className="page-header" style={{ border: "none", marginBottom: "1.5rem" }}>
          <div>
            <div className="eyebrow">Welcome back</div>
            <h1>Log in</h1>
          </div>
        </header>

        {successMessage && (
          <div className="card" style={{ marginBottom: "1.25rem", borderColor: "var(--success)" }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
