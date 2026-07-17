import { DateTime } from "luxon";

export type BookingRescheduledTemplateInput = {
  guestName: string;
  hostName: string;
  oldStartsAt: Date;
  newStartsAt: Date;
};

export function bookingRescheduledTemplate(
  input: BookingRescheduledTemplateInput
) {
  const oldTime = DateTime.fromJSDate(input.oldStartsAt)
    .toLocal()
    .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");

  const newTime = DateTime.fromJSDate(input.newStartsAt)
    .toLocal()
    .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");

  return `
    <h2>Booking Rescheduled</h2>

    <p>Hi ${input.guestName},</p>

    <p>Your meeting with <strong>${input.hostName}</strong> has been rescheduled.</p>

    <p><strong>Previous time:</strong> ${oldTime}</p>

    <p><strong>New time:</strong> ${newTime}</p>

    <p>We look forward to meeting you.</p>
  `;
}