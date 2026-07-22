import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUpcomingBookings } from "../api/bookingsApi";
import { ApiError } from "../api/apiClient";
import AppHeader from "../components/AppHeader";
import { formatDateLong, formatSlotTime } from "../utils/date";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchUpcomingBookings()
      .then((data) => {
        if (!cancelled) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Couldn't load your bookings."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const nextThree = bookings?.slice(0, 3) ?? [];

  async function handleCopyBookingLink() {
    if (!user?.slug) return;

    const bookingUrl = `${window.location.origin}/book/${user.slug}`;

    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.prompt("Copy your booking link:", bookingUrl);
    }
  }

  return (
    <div className="page">
      <div className="page-shell">
        <AppHeader
          eyebrow="Dashboard"
          title={`Welcome back, ${user?.name ?? ""}`}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <Link
            to="/availability"
            className="card"
            style={{ textDecoration: "none" }}
          >
            <div className="eyebrow">Set up</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                marginTop: "0.3rem",
              }}
            >
              Availability
            </div>
          </Link>

          <Link
            to="/bookings"
            className="card"
            style={{ textDecoration: "none" }}
          >
            <div className="eyebrow">Manage</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                marginTop: "0.3rem",
              }}
            >
              Upcoming bookings
            </div>
          </Link>

          {user?.slug && (
            <div className="card">
              <div className="eyebrow">Share</div>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  marginTop: "0.3rem",
                }}
              >
                Your booking page
              </div>

              <div
                style={{
                  color: "var(--ink-soft)",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                  overflowWrap: "anywhere",
                }}
              >
                {window.location.origin}/book/{user.slug}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to={`/book/${user.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-plain"
                >
                  Open
                </Link>

                <button
                  type="button"
                  className="btn-plain"
                  onClick={handleCopyBookingLink}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "1.2rem",
          }}
        >
          Upcoming bookings
        </h2>

        {error && <div className="state-block error">{error}</div>}

        {!error && bookings === null && (
          <div className="state-block">Loading…</div>
        )}

        {!error && bookings !== null && nextThree.length === 0 && (
          <div className="state-block">
            No upcoming bookings yet. Share your{" "}
            {user?.slug ? (
              <Link to={`/book/${user.slug}`}>public booking page</Link>
            ) : (
              "public booking page"
            )}{" "}
            to get started.
          </div>
        )}

        {nextThree.map((booking) => (
          <div className="card" key={booking.id}>
            <div style={{ fontWeight: 600 }}>{booking.guestName}</div>

            <div
              style={{
                color: "var(--ink-soft)",
                fontSize: "0.9rem",
              }}
            >
              {booking.guestEmail}
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                marginTop: "0.4rem",
              }}
            >
              {formatDateLong(booking.startsAt)} &middot;{" "}
              {formatSlotTime(booking.startsAt)}–
              {formatSlotTime(booking.endsAt)}
            </div>
          </div>
        ))}

        {bookings && bookings.length > 3 && (
          <p style={{ marginTop: "1rem" }}>
            <Link to="/bookings">
              View all {bookings.length} upcoming bookings →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}