import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getUpcomingBookingsByHost } from "../models/booking.model.js";

const router = Router();

router.get("/", requireAuth, async (request, response) => {
    if (!request.userId) {
    return response.status(401).json({
      message: "Authentication required",
    });
  }
  try {
    const bookings = await getUpcomingBookingsByHost(
      request.userId
    );

    return response.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("Failed to retrieve bookings:", error);

    return response.status(500).json({
      message: "Failed to retrieve bookings",
    });
  }
});

export default router;