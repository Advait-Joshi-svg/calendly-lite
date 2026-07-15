import pool from "../db/pool.js";

export async function getUserBySlug(slug: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        slug,
        timezone
      FROM users
      WHERE slug = $1;
    `,
    [slug]
  );

  return result.rows[0] ?? null;
}