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
        AND starts_at < $3
        AND ends_at > $2
      LIMIT 1;
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
      ORDER BY starts_at ASC;
    `,
    [hostUserId, dayStart, dayEnd]
  );

  return result.rows;
}

