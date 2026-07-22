import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler.middleware.js";
import authRouter from "./routes/auth.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import publicRoutes from "./routes/public.routes.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://calendly-lite-khaki.vercel.app",
];

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedOrigin = allowedOrigins.includes(origin);

      const isVercelPreview =
        /^https:\/\/calendly-lite-[a-z0-9-]+-advait-joshi-svgs-projects\.vercel\.app$/.test(
          origin
        );

      if (isAllowedOrigin || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
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