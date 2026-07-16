import pool from "../db/pool.js";
import { createBooking } from "../models/booking.model.js";

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

  try {
    await client.query("BEGIN");

    const booking = await createBooking(
      input,
      client
    );

    await client.query("COMMIT");

    return booking;
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
}