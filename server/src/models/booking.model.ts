import pool from "../db/pool.js";
import type { PoolClient } from "pg";
type DatabaseClient = Pick<PoolClient, "query">;

type CreateBookingInput = {
  hostUserId: string;
  guestName: string;
  guestEmail: string;
  startsAt: string;
  endsAt: string;
};


export async function createBooking(
  input: CreateBookingInput,
  client: DatabaseClient = pool
) {
  const result = await client.query(
    `
      INSERT INTO bookings (
        host_user_id,
        guest_name,
        guest_email,
        starts_at,
        ends_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        host_user_id AS "hostUserId",
        guest_name AS "guestName",
        guest_email AS "guestEmail",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        created_at AS "createdAt";
    `,
    [
      input.hostUserId,
      input.guestName,
      input.guestEmail,
      input.startsAt,
      input.endsAt,
    ]
  );

  return result.rows[0];
}

export async function findBookingConflict(
  hostUserId: string,
  startsAt: string,
  endsAt: string,
  client: DatabaseClient = pool
) {
  const result = await client.query(
    `
      SELECT
        id,
        host_user_id AS "hostUserId",
        guest_name AS "guestName",
        guest_email AS "guestEmail",
        starts_at AS "startsAt",
        ends_at AS "endsAt"
      FROM bookings
      WHERE host_user_id = $1
        AND status = 'confirmed'
        AND starts_at < $3
        AND ends_at > $2;
    `,
    [
      hostUserId,
      startsAt,
      endsAt,
    ]
  );

  return result.rows[0] ?? null;
}

export async function getBookingsForDate(
  hostUserId: string,
  dayStart: string,
  dayEnd: string
) {
  const result = await pool.query(
    `
      SELECT
        id,
        starts_at AS "startsAt",
        ends_at AS "endsAt"
      FROM bookings
      WHERE host_user_id = $1
        AND starts_at >= $2
        AND starts_at < $3
        AND status = 'confirmed';
    `,
    [hostUserId, dayStart, dayEnd]
  );

  return result.rows;
}

export async function getUpcomingBookingsByHost(
  hostUserId: string
) {
  const result = await pool.query(
    `
      SELECT
        id,
        guest_name AS "guestName",
        guest_email AS "guestEmail",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        status,
        created_at AS "createdAt",
        rescheduled_at AS "rescheduledAt"
      FROM bookings
      WHERE host_user_id = $1
        AND ends_at >= NOW()
        AND status = 'confirmed'
      ORDER BY starts_at ASC;
    `,
    [hostUserId]
  );

  return result.rows;
}

export type CancelBookingResult =
  | {
      outcome: "cancelled";
      booking: {
        id: string;
        guestName: string;
        guestEmail: string;
        startsAt: Date;
        endsAt: Date;
        status: string;
        cancelledAt: Date;
      };
    }
  | {
      outcome: "already_cancelled";
    }
  | {
      outcome: "forbidden";
    }
  | {
      outcome: "not_found";
    };

export async function cancelBookingByHost(
  bookingId: string,
  hostUserId: string
): Promise<CancelBookingResult> {
  const bookingResult = await pool.query(
    `
      SELECT
        id,
        host_user_id,
        status
      FROM bookings
      WHERE id = $1
    `,
    [bookingId]
  );

  const booking = bookingResult.rows[0];

  if (!booking) {
    return {
      outcome: "not_found",
    };
  }

  if (booking.host_user_id !== hostUserId) {
    return {
      outcome: "forbidden",
    };
  }

  if (booking.status === "cancelled") {
    return {
      outcome: "already_cancelled",
    };
  }

  const cancellationResult = await pool.query(
    `
      UPDATE bookings
      SET
        status = 'cancelled',
        cancelled_at = NOW()
      WHERE id = $1
        AND host_user_id = $2
        AND status = 'confirmed'
      RETURNING
        id,
        guest_name AS "guestName",
        guest_email AS "guestEmail",
        starts_at AS "startsAt",
        ends_at AS "endsAt",
        status,
        cancelled_at AS "cancelledAt"
    `,
    [bookingId, hostUserId]
  );

  const cancelledBooking = cancellationResult.rows[0];

  if (!cancelledBooking) {
    return {
      outcome: "already_cancelled",
    };
  }

  return {
    outcome: "cancelled",
    booking: cancelledBooking,
  };
}

export type RescheduleBookingResult =
  | {
      outcome: "rescheduled";
      booking: {
        id: string;
        guestName: string;
        guestEmail: string;
        startsAt: Date;
        endsAt: Date;
        status: string;
        rescheduledAt: Date;
      };
      previousStartsAt: Date;
      previousEndsAt: Date;
    }
  | { outcome: "not_found" }
  | { outcome: "forbidden" }
  | { outcome: "cancelled" }
  | { outcome: "conflict" };

  export async function rescheduleBookingByHost(
  bookingId: string,
  hostUserId: string,
  startsAt: Date,
  endsAt: Date
): Promise<RescheduleBookingResult> {
  const bookingResult = await pool.query(
    `
      SELECT
        id,
        host_user_id AS "hostUserId",
        status,
        starts_at AS "startsAt",
        ends_at AS "endsAt"
      FROM bookings
      WHERE id = $1
    `,
    [bookingId]
  );

  const booking = bookingResult.rows[0];

  if (!booking) {
    return { outcome: "not_found" };
  }

  if (booking.hostUserId !== hostUserId) {
    return { outcome: "forbidden" };
  }

  if (booking.status === "cancelled") {
    return { outcome: "cancelled" };
  }

  try {
    const updateResult = await pool.query(
      `
        UPDATE bookings
        SET
          starts_at = $1,
          ends_at = $2,
          rescheduled_at = NOW()
        WHERE id = $3
          AND host_user_id = $4
          AND status = 'confirmed'
        RETURNING
          id,
          guest_name AS "guestName",
          guest_email AS "guestEmail",
          starts_at AS "startsAt",
          ends_at AS "endsAt",
          status,
          rescheduled_at AS "rescheduledAt"
      `,
      [startsAt, endsAt, bookingId, hostUserId]
    );

    const rescheduledBooking = updateResult.rows[0];

    if (!rescheduledBooking) {
      return { outcome: "cancelled" };
    }

    return {
      outcome: "rescheduled",
      booking: rescheduledBooking,
      previousStartsAt: booking.startsAt,
      previousEndsAt: booking.endsAt,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01"
    ) {
      return { outcome: "conflict" };
    }

    throw error;
  }
}