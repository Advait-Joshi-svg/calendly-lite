import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-shell narrow" style={{ textAlign: "center", paddingTop: "3rem" }}>
        <div className="eyebrow">404</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", marginTop: "0.5rem" }}>
          Page not found
        </h1>
        <p style={{ color: "var(--ink-soft)", marginTop: "0.75rem" }}>
          <Link to="/">Go back home</Link>
        </p>
      </div>
    </div>
  );
}
