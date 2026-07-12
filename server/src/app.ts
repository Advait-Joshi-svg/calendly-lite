import express from "express";
import pool from "./db/pool.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.get("/api/users", async (_request, response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, slug, timezone, created_at FROM users"
    );

    response.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error("Failed to retrieve users:", error);

    response.status(500).json({
      message: "Failed to retrieve users",
    });
  }
});

export default app;