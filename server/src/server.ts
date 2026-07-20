import app from "./app.js";
import pool from "./db/pool.js";
import { env } from "./config/env.js";


async function startServer() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    console.log("Database connected");
    console.log("Database time:", result.rows[0].current_time);

    app.listen(env.PORT, () => {
  console.log(`Server is running at http://localhost:${env.PORT}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();