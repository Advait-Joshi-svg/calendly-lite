import { DateTime } from "luxon";

type BookingConfirmationTemplateInput = {
  guestName: string;
  hostName: string;
  startsAt: Date;
  endsAt: Date;
};

export function bookingConfirmationTemplate(
  input: BookingConfirmationTemplateInput
) {
  const starts = DateTime.fromJSDate(input.startsAt)
    .toLocal()
    .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");

  const ends = DateTime.fromJSDate(input.endsAt)
    .toLocal()
    .toFormat("h:mm a");

  return `
    <h2>Booking Confirmed</h2>

    <p>Hi ${input.guestName},</p>

    <p>Your meeting has been confirmed.</p>

    <table>
      <tr>
        <td><strong>Host</strong></td>
        <td>${input.hostName}</td>
      </tr>

      <tr>
        <td><strong>Starts</strong></td>
        <td>${starts}</td>
      </tr>

      <tr>
        <td><strong>Ends</strong></td>
        <td>${ends}</td>
      </tr>
    </table>

    <p>We look forward to meeting you.</p>
  `;
}