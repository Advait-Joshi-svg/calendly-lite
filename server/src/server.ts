import app from "./app.js";
import pool from "./db/pool.js";
import { env } from "./config/env.js";
import "dotenv/config";

async function startServer() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    console.log("Database connected");

    app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();