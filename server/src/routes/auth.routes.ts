import { Router } from "express";
import pool from "../db/pool.js";
import { hashPassword } from "../lib/password.js";
import { registerSchema } from "../schemas/auth.schema.js";

const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  try {
    const validationResult = registerSchema.safeParse(request.body);

    if (!validationResult.success) {
      return response.status(400).json({
        message: "Invalid registration data",
        errors: validationResult.error.issues,
      });
    }

    const { name, email, password, slug } = validationResult.data;

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          slug
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, slug, timezone, created_at
      `,
      [name, email, passwordHash, slug]
    );

    return response.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return response.status(409).json({
        error: "An account with this email or slug already exists",
      });
    }

    console.error(error);

    return response.status(500).json({
      error: "Internal server error",
    });
  }
});

export default authRouter;