import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getUpcomingBookingsByHost } from "../models/booking.model.js";
import { cancelBookingByHost } from "../models/booking.model.js";
import { rescheduleBookingSchema } from "../schemas/booking.schema.js";
import { rescheduleBookingByHost } from "../models/booking.model.js";
import { getUserById } from "../models/user.model.js";
import {
  sendBookingCancelledEmail,
  sendBookingRescheduledEmail,
} from "../services/email.service.js";

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

router.patch(
  "/:bookingId/cancel",
  requireAuth,
  async (request, response) => {
    try {
      const bookingId = request.params.bookingId;

      if (typeof bookingId !== "string") {
        return response.status(400).json({
        message: "Invalid booking ID",
            });
          }
      const hostUserId = request.userId;

      if (!hostUserId) {
        return response.status(401).json({
          message: "Authentication required",
        });
      }

      const result = await cancelBookingByHost(
        bookingId,
        hostUserId
      );

      if (result.outcome === "not_found") {
        return response.status(404).json({
          message: "Booking not found",
        });
      }

      if (result.outcome === "forbidden") {
        return response.status(403).json({
          message: "You are not authorized to cancel this booking",
        });
      }

      if (result.outcome === "already_cancelled") {
        return response.status(409).json({
          message: "Booking has already been cancelled",
        });
      }

      try {
  const host = await getUserById(hostUserId);

  if (host) {
    await sendBookingCancelledEmail({
      guestName: result.booking.guestName,
      guestEmail: result.booking.guestEmail,
      hostName: host.name,
      startsAt: new Date(result.booking.startsAt),
    });
  }
} catch (emailError) {
  console.error(
    "Booking cancelled, but cancellation email failed:",
    emailError
  );
}

return response.status(200).json({
    message: "Booking cancelled successfully",
    booking: result.booking,
      });  
    } catch (error) {
      console.error("Cancel booking error:", error);

      return response.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

router.patch(
  "/:bookingId/reschedule",
  requireAuth,
  async (request, response) => {
    try {
      const bookingId = request.params.bookingId;

      if (typeof bookingId !== "string") {
        return response.status(400).json({
          message: "Invalid booking ID",
        });
      }

      const parsed = rescheduleBookingSchema.safeParse(request.body);

      if (!parsed.success) {
        return response.status(400).json({
          message: "Invalid request",
          errors: parsed.error.issues,
        });
      }

      const { startsAt, endsAt } = parsed.data;

      const result = await rescheduleBookingByHost(
        bookingId,
        request.userId!,
        new Date(startsAt),
        new Date(endsAt)
      );

      switch (result.outcome) {
        case "not_found":
          return response.status(404).json({
            message: "Booking not found",
          });

        case "forbidden":
          return response.status(403).json({
            message: "You are not authorized to reschedule this booking",
          });

        case "cancelled":
          return response.status(409).json({
            message: "Cancelled bookings cannot be rescheduled",
          });

        case "conflict":
          return response.status(409).json({
            message: "The requested time slot is unavailable",
          });

        case "rescheduled": {
          try {
            const host = await getUserById(request.userId!);

            if (host) {
              await sendBookingRescheduledEmail({
                guestName: result.booking.guestName,
                guestEmail: result.booking.guestEmail,
                hostName: host.name,
                oldStartsAt: new Date(result.previousStartsAt),
                newStartsAt: new Date(result.booking.startsAt),
              });
            }
          } catch (emailError) {
            console.error(
              "Booking rescheduled, but reschedule email failed:",
              emailError
            );
          }

  return response.status(200).json({
    message: "Booking rescheduled successfully",
    booking: result.booking,
  });
}
      }
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

export default router;