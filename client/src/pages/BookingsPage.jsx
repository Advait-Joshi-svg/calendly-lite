import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { fetchUpcomingBookings, cancelBooking, rescheduleBooking } from "../api/bookingsApi";
import { ApiError } from "../api/apiClient";
import { formatDateLong, formatSlotTime } from "../utils/date";

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [rowState, setRowState] = useState({}); // id -> { busy, error, rescheduling, newDate, newTime }

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoadError("");
    fetchUpcomingBookings()
      .then((data) => setBookings(data.bookings))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Couldn't load bookings."));
  }

  function patchRow(id, patch) {
    setRowState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function handleCancel(id) {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this booking?"
      );

      if (!confirmed) {
        return;
      }
    patchRow(id, { busy: true, error: "" });
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      patchRow(id, {
        busy: false,
        error: err instanceof ApiError ? err.message : "Couldn't cancel this booking.",
      });
    }
  }

  function openReschedule(booking) {
    const d = new Date(booking.startsAt);
    const pad = (n) => String(n).padStart(2, "0");
    patchRow(booking.id, {
      rescheduling: true,
      error: "",
      newDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      newTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    });
  }

  async function submitReschedule(booking) {
    const row = rowState[booking.id];
    if (!row?.newDate || !row?.newTime) return;

    patchRow(booking.id, { busy: true, error: "" });
    try {
      const start = new Date(`${row.newDate}T${row.newTime}:00`);
      const durationMs = new Date(booking.endsAt).getTime() - new Date(booking.startsAt).getTime();
      const end = new Date(start.getTime() + durationMs);

      const data = await rescheduleBooking(booking.id, {
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      });

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? data.booking : b)));
      patchRow(booking.id, { busy: false, rescheduling: false });
    } catch (err) {
      patchRow(booking.id, {
        busy: false,
        error: err instanceof ApiError ? err.message : "Couldn't reschedule this booking.",
      });
    }
  }

  return (
    <div className="page">
      <div className="page-shell">
        <AppHeader eyebrow="Manage" title="Upcoming bookings" />

        {loadError && <div className="state-block error">{loadError}</div>}
        {!loadError && bookings === null && <div className="state-block">Loading…</div>}
        {!loadError && bookings !== null && bookings.length === 0 && (
          <div className="state-block">No upcoming bookings.</div>
        )}

        {bookings?.map((booking) => {
          const row = rowState[booking.id] ?? {};
          return (
            <div className="card" key={booking.id}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{booking.guestName}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>{booking.guestEmail}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                    {formatDateLong(booking.startsAt)} &middot; {formatSlotTime(booking.startsAt)}–{formatSlotTime(booking.endsAt)}
                  </div>
                </div>

                {!row.rescheduling && (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <button className="btn-plain" disabled={row.busy} onClick={() => openReschedule(booking)}>
                      Reschedule
                    </button>
                    <button className="btn-danger" disabled={row.busy} onClick={() => handleCancel(booking.id)}>
                      {row.busy ? "Cancelling…" : "Cancel"}
                    </button>
                  </div>
                )}
              </div>

              {row.rescheduling && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label>New date</label>
                    <input
                      type="date"
                      value={row.newDate}
                      onChange={(e) => patchRow(booking.id, { newDate: e.target.value })}
                    />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>New time</label>
                    <input
                      type="time"
                      value={row.newTime}
                      onChange={(e) => patchRow(booking.id, { newTime: e.target.value })}
                    />
                  </div>
                  <button className="btn-primary" disabled={row.busy} onClick={() => submitReschedule(booking)}>
                    {row.busy ? "Saving…" : "Confirm new time"}
                  </button>
                  <button
                    className="btn-plain"
                    disabled={row.busy}
                    onClick={() => patchRow(booking.id, { rescheduling: false, error: "" })}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {row.error && <div className="form-error">{row.error}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
