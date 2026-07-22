import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="page">
      <div className="page-shell narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <div className="eyebrow">Calendly Lite</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: "0.5rem 0 1rem" }}>
          Simple scheduling, done right
        </h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: "1.5rem" }}>
          Set your availability and let people book time with you — no back-and-forth emails.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: "none" }}>
            Get started
          </Link>
          <Link to="/login" className="btn-plain" style={{ textDecoration: "none" }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
