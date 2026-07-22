import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import authRouter from "./routes/auth.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import publicRoutes from "./routes/public.routes.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
  })
);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/availability", availabilityRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(errorHandler);

export default app;