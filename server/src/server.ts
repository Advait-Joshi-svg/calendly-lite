import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import pool from "./db/pool.js";

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

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