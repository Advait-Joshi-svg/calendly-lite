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

export async function getUserById(id: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        slug,
        timezone
      FROM users
      WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] ?? null;
}