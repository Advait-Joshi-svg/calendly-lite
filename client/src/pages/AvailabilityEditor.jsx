import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import {
  fetchAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../api/availabilityApi";
import { ApiError } from "../api/apiClient";
import { DAY_NAMES_FULL } from "../utils/date";
import { toast } from "sonner";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

export default function AvailabilityEditor() {
  // One row per weekday (0-6). `rule` is null until the host enables that day.
  const [days, setDays] = useState(
    DAY_NAMES_FULL.map((_, dayOfWeek) => ({
      dayOfWeek,
      rule: null,
      startTime: DEFAULT_START,
      endTime: DEFAULT_END,
      saving: false,
      error: "",
    }))
  );
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability()
      .then((data) => {
        setDays((prev) =>
          prev.map((day) => {
            // Backend returns snake_case here: day_of_week, start_time, end_time.
            const match = data.availability.find((r) => r.day_of_week === day.dayOfWeek);
            if (!match) return day;
            return {
              ...day,
              rule: match,
              startTime: match.start_time.slice(0, 5),
              endTime: match.end_time.slice(0, 5),
            };
          })
        );
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load your availability.");
      })
      .finally(() => setLoading(false));
  }, []);

  function patchDay(dayOfWeek, patch) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
  }

  async function handleEnable(dayOfWeek) {
  const day = days.find((d) => d.dayOfWeek === dayOfWeek);
  patchDay(dayOfWeek, { saving: true, error: "" });

  try {
    const data = await createAvailability({
      dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime,
    });

    patchDay(dayOfWeek, {
      rule: data.availability,
      saving: false,
    });

    toast.success(
      `${DAY_NAMES_FULL[dayOfWeek]} availability enabled`
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 500
        ? "This day may already have availability set — try refreshing the page."
        : err instanceof ApiError
        ? err.message
        : "Couldn't save this day.";

    patchDay(dayOfWeek, {
      saving: false,
      error: message,
    });

    toast.error(message);
  }
}

  async function handleDisable(dayOfWeek) {
  const day = days.find((d) => d.dayOfWeek === dayOfWeek);
  if (!day.rule) return;

  patchDay(dayOfWeek, { saving: true, error: "" });

  try {
    await deleteAvailability(day.rule.id);

    patchDay(dayOfWeek, {
      rule: null,
      saving: false,
    });

    toast.success(
      `${DAY_NAMES_FULL[dayOfWeek]} availability removed`
    );
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Couldn't remove this day.";

    patchDay(dayOfWeek, {
      saving: false,
      error: message,
    });

    toast.error(message);
  }
}

  async function handleSaveTimes(dayOfWeek) {
  const day = days.find((d) => d.dayOfWeek === dayOfWeek);
  if (!day.rule) return;

  if (day.startTime >= day.endTime) {
    const message = "End time must be later than start time.";

    patchDay(dayOfWeek, {
      error: message,
    });

    toast.error(message);
    return;
  }

  patchDay(dayOfWeek, {
    saving: true,
    error: "",
  });

  try {
    const data = await updateAvailability(day.rule.id, {
      dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime,
    });

    patchDay(dayOfWeek, {
      rule: data.availability,
      saving: false,
    });

    toast.success(
      `${DAY_NAMES_FULL[dayOfWeek]} availability updated`
    );
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Couldn't save those times.";

    patchDay(dayOfWeek, {
      saving: false,
      error: message,
    });

    toast.error(message);
  }
}

  return (
    <div className="page">
      <div className="page-shell">
        <AppHeader eyebrow="Set up" title="Weekly availability" />

        {loadError && <div className="state-block error">{loadError}</div>}
        {loading && !loadError && <div className="state-block">Loading…</div>}

        {!loading && !loadError && (
          <div>
            {days.map((day) => {
              const enabled = !!day.rule;
              return (
                <div className="card" key={day.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "130px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={day.saving}
                      onChange={() => (enabled ? handleDisable(day.dayOfWeek) : handleEnable(day.dayOfWeek))}
                    />
                    {DAY_NAMES_FULL[day.dayOfWeek]}
                  </label>

                  {enabled && (
                    <>
                      <div className="field" style={{ margin: 0 }}>
                        <input
                          type="time"
                          value={day.startTime}
                          disabled={day.saving}
                          onChange={(e) => patchDay(day.dayOfWeek, { startTime: e.target.value })}
                          aria-label={`${DAY_NAMES_FULL[day.dayOfWeek]} start time`}
                        />
                      </div>
                      <span style={{ color: "var(--ink-soft)" }}>to</span>
                      <div className="field" style={{ margin: 0 }}>
                        <input
                          type="time"
                          value={day.endTime}
                          disabled={day.saving}
                          onChange={(e) => patchDay(day.dayOfWeek, { endTime: e.target.value })}
                          aria-label={`${DAY_NAMES_FULL[day.dayOfWeek]} end time`}
                        />
                      </div>
                      <button
                        className="btn-plain"
                        disabled={day.saving}
                        onClick={() => handleSaveTimes(day.dayOfWeek)}
                      >
                        {day.saving ? "Saving…" : "Save"}
                      </button>
                    </>
                  )}

                  {!enabled && <span style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Unavailable</span>}

                  {day.error && <div className="form-error" style={{ width: "100%" }}>{day.error}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
