import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPublicSlots,
  createPublicBooking,
} from "../api/publicApi";
import { ApiError } from "../api/apiClient";
import {
  toLocalISODate,
  addDays,
  startOfToday,
  DAY_NAMES,
  formatSlotTime,
  formatDateLong,
} from "../utils/date";
import "./PublicBookingPage.css";

function buildDateOptions(count = 7) {
  const today = startOfToday();

  return Array.from(
    { length: count },
    (_, i) => addDays(today, i)
  );
}

function groupSlotsByPeriod(slots) {
  const groups = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  for (const slot of slots) {
    const hour = new Date(slot.startsAt).getHours();

    if (hour < 12) {
      groups.Morning.push(slot);
    } else if (hour < 17) {
      groups.Afternoon.push(slot);
    } else {
      groups.Evening.push(slot);
    }
  }

  return groups;
}

export default function PublicBookingPage() {
  const { slug } = useParams();

  const dateOptions = useMemo(
    () => buildDateOptions(7),
    []
  );

  const [selectedDate, setSelectedDate] = useState(
    dateOptions[0]
  );

  const [hostName, setHostName] = useState("");
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setErrorMessage("");
    setSelectedSlot(null);
    setConfirmedBooking(null);

    fetchPublicSlots(
      slug,
      toLocalISODate(selectedDate)
    )
      .then((data) => {
        if (cancelled) return;

        setHostName(data.host?.name ?? "");
        setSlots(data.slots ?? []);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;

        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Something went wrong."
        );

        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug, selectedDate]);

  async function handleConfirm() {
    if (!selectedSlot) {
      setSubmitError("Select a time to continue.");
      return;
    }

    if (!guestName.trim() || !guestEmail.trim()) {
      setSubmitError(
        "Add your name and email to confirm."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const data = await createPublicBooking(slug, {
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      });

      setConfirmedBooking(data.booking);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 409
      ) {
        setSlots((previousSlots) =>
          previousSlots.filter(
            (slot) =>
              slot.startsAt !== selectedSlot.startsAt
          )
        );

        setSelectedSlot(null);
      }

      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const grouped = groupSlotsByPeriod(slots);
  const hasAnySlots = slots.length > 0;

  return (
    <div className="page">
      <div className="page-shell">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              Book time with
            </div>

            <h1>{hostName || slug}</h1>
          </div>
        </header>

        <div className="booking-layout">
          <nav
            className="date-rail"
            aria-label="Choose a date"
          >
            {dateOptions.map((dateOption) => {
              const optionDate =
                toLocalISODate(dateOption);

              const active =
                optionDate ===
                toLocalISODate(selectedDate);

              return (
                <button
                  key={optionDate}
                  className={`date-chip${
                    active ? " active" : ""
                  }`}
                  onClick={() =>
                    setSelectedDate(dateOption)
                  }
                  aria-pressed={active}
                >
                  <span className="dow">
                    {DAY_NAMES[dateOption.getDay()]}
                  </span>

                  {dateOption.getDate()}{" "}
                  {dateOption.toLocaleString(
                    undefined,
                    { month: "short" }
                  )}
                </button>
              );
            })}
          </nav>

          <div>
            {status === "loading" && (
              <div className="state-block">
                Loading open times…
              </div>
            )}

            {status === "error" && (
              <div className="state-block error">
                {errorMessage}
              </div>
            )}

            {status === "ready" &&
              !hasAnySlots && (
                <div className="state-block">
                  No open times on this day. Try
                  another date on the left.
                </div>
              )}

            {status === "ready" &&
              hasAnySlots && (
                <>
                  {Object.entries(grouped).map(
                    ([label, groupSlotsList]) =>
                      groupSlotsList.length ===
                      0 ? null : (
                        <div
                          className="slot-group"
                          key={label}
                        >
                          <div className="slot-group-label">
                            {label}
                          </div>

                          <div className="slot-grid">
                            {groupSlotsList.map(
                              (slot) => (
                                <button
                                  key={
                                    slot.startsAt
                                  }
                                  className={`slot-btn${
                                    selectedSlot?.startsAt ===
                                    slot.startsAt
                                      ? " selected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedSlot(
                                      slot
                                    );
                                    setSubmitError(
                                      ""
                                    );
                                    setConfirmedBooking(
                                      null
                                    );
                                  }}
                                >
                                  {formatSlotTime(
                                    slot.startsAt
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )
                  )}
                </>
              )}

            {selectedSlot &&
              !confirmedBooking && (
                <div className="ticket">
                  <div className="ticket-main">
                    <div className="eyebrow">
                      Selected time
                    </div>

                    <div className="time">
                      {formatSlotTime(
                        selectedSlot.startsAt
                      )}{" "}
                      &middot;{" "}
                      {formatDateLong(
                        selectedSlot.startsAt
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(event) =>
                        setGuestName(
                          event.target.value
                        )
                      }
                      aria-label="Your name"
                    />

                    <input
                      type="email"
                      placeholder="Your email"
                      value={guestEmail}
                      onChange={(event) =>
                        setGuestEmail(
                          event.target.value
                        )
                      }
                      aria-label="Your email"
                    />

                    {submitError && (
                      <div className="form-error">
                        {submitError}
                      </div>
                    )}
                  </div>

                  <div className="ticket-stub">
                    <div className="ticket-actions">
                      <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={submitting}
                      >
                        {submitting
                          ? "Booking…"
                          : "Confirm"}
                      </button>

                      <button
                        className="btn-plain"
                        onClick={() =>
                          setSelectedSlot(null)
                        }
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {confirmedBooking && (
              <div className="confirmed-card">
                <div className="label">
                  Confirmed
                </div>

                <h2>You're booked</h2>

                <p>
                  {formatSlotTime(
                    confirmedBooking.startsAt
                  )}{" "}
                  on{" "}
                  {formatDateLong(
                    confirmedBooking.startsAt
                  )}
                  . A confirmation email is on its
                  way to {guestEmail}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}