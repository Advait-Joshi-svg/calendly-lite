import type { Response } from "express";
import { Router } from "express";
import {
  getPublicSlotsParamsSchema,
  getPublicSlotsQuerySchema,
} from "../schemas/public-booking.schema.js";
import { getAvailabilityRulesBySlugAndDay } from "../models/availability.model.js";
import {
  generateTimeSlots,
  removeBookedSlots,
} from "../services/availability.service.js";
import { createBookingSchema } from "../schemas/booking.schema.js";
import { getUserBySlug } from "../models/user.model.js";
import { getBookingsForDate } from "../models/booking.model.js";

import {
  bookPublicSlot,
  BookingConflictError,
} from "../services/booking.service.js";
import { DateTime } from "luxon";

const router = Router();

router.get("/users/:slug/slots", async (request, response) => {
  const paramsResult =
    getPublicSlotsParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return response.status(400).json({
      message: "Invalid route parameters",
      errors: paramsResult.error.issues,
    });
  }

  const queryResult =
    getPublicSlotsQuerySchema.safeParse(request.query);

  if (!queryResult.success) {
    return response.status(400).json({
      message: "Invalid query parameters",
      errors: queryResult.error.issues,
    });
  }

  const { slug } = paramsResult.data;
  const { date } = queryResult.data;

  const requestedDate = new Date(`${date}T00:00:00Z`);
  const dayOfWeek = requestedDate.getUTCDay();

  const rules = await getAvailabilityRulesBySlugAndDay(
    slug,
    dayOfWeek
  );

  const firstRule = rules[0];

  if (!firstRule) {
    return response.json({
      slug,
      date,
      timezone: null,
      slots: [],
    });
  }

  const timezone = firstRule.timezone;

  const slots = generateTimeSlots(
    rules,
    date,
    timezone
  );

  const dayStart = DateTime.fromISO(date, {
    zone: timezone,
  }).startOf("day");

  const dayEnd = dayStart.plus({ days: 1 });

  const dayStartUtc = dayStart.toUTC().toISO();
  const dayEndUtc = dayEnd.toUTC().toISO();

  if (!dayStartUtc || !dayEndUtc) {
    return response.status(500).json({
      message: "Failed to calculate booking date range",
    });
  }

  const bookings = await getBookingsForDate(
    firstRule.userId,
    dayStartUtc,
    dayEndUtc
  );

  const availableSlots = removeBookedSlots(
    slots,
    bookings
  );

  return response.json({
    slug,
    date,
    timezone,
    slots: availableSlots,
  });
});

router.post(
  "/users/:slug/bookings",
  async (request, response) => {
   const paramsResult =
  getPublicSlotsParamsSchema.safeParse(request.params);

if (!paramsResult.success) {
  return response.status(400).json({
    message: "Invalid route parameters",
    errors: paramsResult.error.issues,
  });
}

const { slug } = paramsResult.data;
const bodyResult =
  createBookingSchema.safeParse(request.body);

if (!bodyResult.success) {
  return response.status(400).json({
    message: "Invalid booking data",
    errors: bodyResult.error.issues,
  });
}
const {
  guestName,
  guestEmail,
  startsAt,
  endsAt,
} = bodyResult.data;
const host = await getUserBySlug(slug);

if (!host) {
  return response.status(404).json({
    message: "Host not found",
  });
}

try {
  const booking = await bookPublicSlot({
    hostUserId: host.id,
    guestName,
    guestEmail,
    startsAt,
    endsAt,
  });

  return response.status(201).json({
    message: "Booking created successfully",
    booking,
  });
} catch (error) {
  if (error instanceof BookingConflictError) {
    return response.status(409).json({
      message: error.message,
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Failed to create booking",
  });
}
  }
);
export default router;