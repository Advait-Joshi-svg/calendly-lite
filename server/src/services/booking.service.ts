import pool from "../db/pool.js";
import { createBooking } from "../models/booking.model.js";
import { sendBookingConfirmationEmail } from "./email.service.js";
import { getUserById } from "../models/user.model.js";
export class BookingConflictError extends Error {
  constructor() {
    super("This time slot is no longer available");
    this.name = "BookingConflictError";
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
  const client = await pool.connect();

  let booking;

  try {
    await client.query("BEGIN");

    booking = await createBooking(
      input,
      client
    );

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
      await sendBookingConfirmationEmail(
        booking.guestName,
        booking.guestEmail,
        new Date(booking.startsAt),
        new Date(booking.endsAt),
        host.name
      );
    }
  } catch (error) {
    console.error(
      "Booking created, but confirmation email failed:",
      error
    );
  }

  return booking;
}