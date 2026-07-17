import { DateTime } from "luxon";

type BookingCancelledTemplateInput = {
  guestName: string;
  hostName: string;
  startsAt: Date;
};

export function bookingCancelledTemplate(
  input: BookingCancelledTemplateInput
) {
  const starts = DateTime.fromJSDate(input.startsAt)
    .toLocal()
    .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");

  return `
    <h2>Booking Cancelled</h2>

    <p>Hi ${input.guestName},</p>

    <p>
      Your meeting with
      <strong>${input.hostName}</strong>
      has been cancelled.
    </p>

    <p>
      <strong>Scheduled for:</strong>
      ${starts}
    </p>

    <p>If this was unexpected, please contact your host.</p>
  `;
}