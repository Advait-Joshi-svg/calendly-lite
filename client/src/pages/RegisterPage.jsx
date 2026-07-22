import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function clearFieldError(fieldName) {
    setFieldErrors((current) => ({
      ...current,
      [fieldName]: "",
    }));

    setError("");
  }

  function handleNameChange(value) {
    setName(value);
    clearFieldError("name");

    if (!slugTouched) {
      setSlug(slugify(value));
      clearFieldError("slug");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        slug,
      });

      navigate("/login", {
        state: {
          message: "Account created — log in to continue.",
        },
      });
    } catch (err) {
      let message = "Something went wrong.";

      if (err instanceof ApiError) {
        message = err.message;

        if (err.details) {
          const perField = {};

          for (const issue of err.details) {
            const key = issue.path?.[0];

            if (key) {
              perField[key] = issue.message;
            }
          }

          setFieldErrors(perField);
        }
      }

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-shell narrow">
        <header
          className="page-header"
          style={{
            border: "none",
            marginBottom: "1.5rem",
          }}
        >
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
              autoComplete="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={submitting}
              required
            />

            {fieldErrors.name && (
              <div className="form-error">
                {fieldErrors.name}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              disabled={submitting}
              required
            />

            {fieldErrors.email && (
              <div className="form-error">
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                disabled={submitting}
                required
                minLength={8}
                style={{ paddingRight: "4.5rem" }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                disabled={submitting}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="field-hint">
              At least 8 characters.
            </div>

            {fieldErrors.password && (
              <div className="form-error">
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="slug">
              Public booking URL
            </label>

            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
                clearFieldError("slug");
              }}
              disabled={submitting}
              required
            />

            <div className="field-hint">
              yourapp.com/book/{slug || "your-slug"}
            </div>

            {fieldErrors.slug && (
              <div className="form-error">
                {fieldErrors.slug}
              </div>
            )}
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "0.5rem",
            }}
          >
            {submitting
              ? "Creating account…"
              : "Create account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            color: "var(--ink-soft)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}