import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/apiClient";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function handleNameChange(value) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({ name, email, password, slug });
      navigate("/login", {
        state: { message: "Account created — log in to continue." },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          const perField = {};
          for (const issue of err.details) {
            const key = issue.path?.[0];
            if (key) perField[key] = issue.message;
          }
          setFieldErrors(perField);
        }
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-shell narrow">
        <header className="page-header" style={{ border: "none", marginBottom: "1.5rem" }}>
          <div>
            <div className="eyebrow">Get started</div>
            <h1>Create your account</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
          </div>

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
            {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <div className="field-hint">At least 8 characters.</div>
            {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
          </div>

          <div className="field">
            <label htmlFor="slug">Public booking URL</label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
            <div className="field-hint">yourapp.com/book/{slug || "your-slug"}</div>
            {fieldErrors.slug && <div className="form-error">{fieldErrors.slug}</div>}
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
