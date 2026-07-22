import { DateTime } from "luxon";

import pool from "../db/pool.js";
import { createBooking } from "../models/booking.model.js";
import { getUserById } from "../models/user.model.js";
import { sendBookingConfirmationEmail } from "./email.service.js";

const SLOT_DURATION_MINUTES = 30;

export class BookingConflictError extends Error {
  constructor() {
    super("This time slot is no longer available");
    this.name = "BookingConflictError";
  }
}

export class BookingOutsideAvailabilityError extends Error {
  constructor() {
    super("The requested time is outside the host's availability");
    this.name = "BookingOutsideAvailabilityError";
  }
}

export class InvalidBookingSlotError extends Error {
  constructor() {
    super("The requested time is not a valid booking slot");
    this.name = "InvalidBookingSlotError";
  }
}

type BookingTimeInput = {
  hostUserId: string;
  startsAt: string | Date;
  endsAt: string | Date;
};

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export async function assertBookingWithinAvailability(
  input: BookingTimeInput
): Promise<void> {
  const host = await getUserById(input.hostUserId);

  if (!host) {
    throw new BookingOutsideAvailabilityError();
  }

  const startDate = toDate(input.startsAt);
  const endDate = toDate(input.endsAt);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new InvalidBookingSlotError();
  }

  const localStart = DateTime.fromJSDate(startDate, {
    zone: "utc",
  }).setZone(host.timezone);

  const localEnd = DateTime.fromJSDate(endDate, {
    zone: "utc",
  }).setZone(host.timezone);

  if (!localStart.isValid || !localEnd.isValid) {
    throw new InvalidBookingSlotError();
  }

  if (localEnd <= localStart) {
    throw new InvalidBookingSlotError();
  }

  if (localStart.toISODate() !== localEnd.toISODate()) {
    throw new InvalidBookingSlotError();
  }

  const durationMinutes = localEnd.diff(
    localStart,
    "minutes"
  ).minutes;

  if (durationMinutes !== SLOT_DURATION_MINUTES) {
    throw new InvalidBookingSlotError();
  }

  const startsOnHalfHour =
    (localStart.minute === 0 || localStart.minute === 30) &&
    localStart.second === 0 &&
    localStart.millisecond === 0;

  const endsOnHalfHour =
    (localEnd.minute === 0 || localEnd.minute === 30) &&
    localEnd.second === 0 &&
    localEnd.millisecond === 0;

  if (!startsOnHalfHour || !endsOnHalfHour) {
    throw new InvalidBookingSlotError();
  }

  // Luxon: Monday = 1 ... Sunday = 7.
  // Database: Sunday = 0 ... Saturday = 6.
  const dayOfWeek = localStart.weekday % 7;

  const startTime = localStart.toFormat("HH:mm:ss");
  const endTime = localEnd.toFormat("HH:mm:ss");

  const result = await pool.query(
    `
      SELECT id
      FROM availability_rules
      WHERE user_id = $1
        AND day_of_week = $2
        AND start_time <= $3::time
        AND end_time >= $4::time
      LIMIT 1
    `,
    [
      input.hostUserId,
      dayOfWeek,
      startTime,
      endTime,
    ]
  );

  if (result.rowCount === 0) {
    throw new BookingOutsideAvailabilityError();
  }
}

type BookPublicSlotInput = {
  hostUserId: string;
  guestName: string;
  guestEmail: string;
  startsAt: string;
  endsAt: string;
};

export async function bookPublicSlot(
  input: BookPublicSlotInput
) {
  await assertBookingWithinAvailability({
    hostUserId: input.hostUserId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });

  const client = await pool.connect();

  let booking;

  try {
    await client.query("BEGIN");

    booking = await createBooking(input, client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01"
    ) {
      throw new BookingConflictError();
    }

    throw error;
  } finally {
    client.release();
  }

  try {
    const host = await getUserById(input.hostUserId);

    if (host) {
      await sendBookingConfirmationEmail({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        hostName: host.name,
        startsAt: new Date(booking.startsAt),
        endsAt: new Date(booking.endsAt),
      });
    }
  } catch (error) {
    console.error(
      "Booking created, but confirmation email failed:",
      error
    );
  }

  return booking;
}