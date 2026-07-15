import { DateTime } from "luxon";

type AvailabilityRule = {
  startTime: string;
  endTime: string;
};

export type TimeSlot = {
  startsAt: string;
  endsAt: string;
};

const SLOT_DURATION_MINUTES = 30;

export function generateTimeSlots(
  rules: AvailabilityRule[],
  date: string,
  timezone: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const rule of rules) {
    const availabilityStart = DateTime.fromISO(
      `${date}T${rule.startTime}`,
      {
        zone: timezone,
      }
    );

    const availabilityEnd = DateTime.fromISO(
      `${date}T${rule.endTime}`,
      {
        zone: timezone,
      }
    );

    if (!availabilityStart.isValid || !availabilityEnd.isValid) {
      throw new Error("Invalid availability date, time, or timezone");
    }

    let slotStart = availabilityStart;

    while (
      slotStart.plus({ minutes: SLOT_DURATION_MINUTES }) <=
      availabilityEnd
    ) {
      const slotEnd = slotStart.plus({
        minutes: SLOT_DURATION_MINUTES,
      });

      const startsAt = slotStart.toUTC().toISO();
      const endsAt = slotEnd.toUTC().toISO();

      if (!startsAt || !endsAt) {
        throw new Error("Failed to generate slot timestamps");
      }

      slots.push({
        startsAt,
        endsAt,
      });

      slotStart = slotEnd;
    }
  }

  return slots;
}

type Booking = {
  startsAt: string;
  endsAt: string;
};

export function removeBookedSlots(
  slots: TimeSlot[],
  bookings: Booking[]
): TimeSlot[] {
  return slots.filter((slot) => {
    const slotStart = new Date(slot.startsAt).getTime();
    const slotEnd = new Date(slot.endsAt).getTime();

    const hasConflict = bookings.some((booking) => {
      const bookingStart = new Date(booking.startsAt).getTime();
      const bookingEnd = new Date(booking.endsAt).getTime();

      return bookingStart < slotEnd && bookingEnd > slotStart;
    });

    return !hasConflict;
  });
}