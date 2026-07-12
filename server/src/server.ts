import "dotenv/config";
import app from "./app.js";
import pool from "./db/pool.js";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    console.log("Database connected");
    console.log("Database time:", result.rows[0].current_time);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();