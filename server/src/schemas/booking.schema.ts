import { z } from "zod";

export const createBookingSchema = z
  .object({
    guestName: z.string().trim().min(1).max(255),
    guestEmail: z.email(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  })
  .refine(
    (data) =>
      new Date(data.endsAt).getTime() >
      new Date(data.startsAt).getTime(),
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    }
  );

export const rescheduleBookingSchema = z.object({
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});

