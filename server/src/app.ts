import express from "express";
import authRouter from "./routes/auth.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import publicRoutes from "./routes/public.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

const app = express();

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