import  pool  from "../db/pool.js";

type CreateAvailabilityRuleInput = {
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export async function createAvailabilityRule(
  input: CreateAvailabilityRuleInput
) {

    const result = await pool.query(
  `
    INSERT INTO availability_rules (
      user_id,
      day_of_week,
      start_time,
      end_time
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `,
  [
    input.userId,
    input.dayOfWeek,
    input.startTime,
    input.endTime,
  ]
);

  return result.rows[0];
}

export async function getAvailabilityRulesByUserId(
  userId: string
) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        day_of_week,
        start_time,
        end_time,
        created_at,
        updated_at
      FROM availability_rules
      WHERE user_id = $1
      ORDER BY day_of_week ASC;
    `,
    [userId]
  );

  return result.rows;
}

type UpdateAvailabilityRuleInput = {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export async function updateAvailabilityRule(
  input: UpdateAvailabilityRuleInput
) {
  const result = await pool.query(
    `
      UPDATE availability_rules
      SET
        day_of_week = $1,
        start_time = $2,
        end_time = $3,
        updated_at = NOW()
      WHERE id = $4
        AND user_id = $5
      RETURNING *;
    `,
    [
      input.dayOfWeek,
      input.startTime,
      input.endTime,
      input.id,
      input.userId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteAvailabilityRule(
  id: string,
  userId: string
) {
  const result = await pool.query(
    `
      DELETE FROM availability_rules
      WHERE id = $1
        AND user_id = $2
      RETURNING *;
    `,
    [id, userId]
  );

  return result.rows[0] ?? null;
}

type PublicAvailabilityRule = {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export async function getAvailabilityRulesBySlugAndDay(
  slug: string,
  dayOfWeek: number
): Promise<PublicAvailabilityRule[]> {
  const result = await pool.query(
    `
      SELECT
        availability_rules.id,
        availability_rules.user_id AS "userId",
        availability_rules.day_of_week AS "dayOfWeek",
        availability_rules.start_time AS "startTime",
        availability_rules.end_time AS "endTime",
        users.timezone
      FROM availability_rules
      INNER JOIN users
        ON users.id = availability_rules.user_id
      WHERE users.slug = $1
        AND availability_rules.day_of_week = $2
      ORDER BY availability_rules.start_time ASC;
    `,
    [slug, dayOfWeek]
  );

  return result.rows;
}