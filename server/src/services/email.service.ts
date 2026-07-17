import { Resend } from "resend";

import { env } from "../config/env.js";
import { bookingConfirmationTemplate } from "../emails/booking-confirmation.template.js";
import { bookingCancelledTemplate } from "../emails/booking-cancelled.template.js";
import {
  bookingRescheduledTemplate,
  type BookingRescheduledTemplateInput,
} from "../emails/booking-rescheduled.template.js";


const resend = new Resend(env.RESEND_API_KEY);
type BookingConfirmationEmailInput = {
  guestName: string;
  guestEmail: string;
  hostName: string;
  startsAt: Date;
  endsAt: Date;
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  return resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

export async function sendBookingConfirmationEmail(
  input: BookingConfirmationEmailInput
) {
  const html = bookingConfirmationTemplate(input);

  return sendEmail(
    input.guestEmail,
    "Your booking is confirmed",
    html
  );
}

type BookingCancelledEmailInput = {
  guestName: string;
  guestEmail: string;
  hostName: string;
  startsAt: Date;
};

export async function sendBookingCancelledEmail(
  input: BookingCancelledEmailInput
) {
  const html = bookingCancelledTemplate(input);

  return sendEmail(
    input.guestEmail,
    "Your booking has been cancelled",
    html
  );
}

type BookingRescheduledEmailInput =
  BookingRescheduledTemplateInput & {
    guestEmail: string;
  };

export async function sendBookingRescheduledEmail(
  input: BookingRescheduledEmailInput
) {
  const html = bookingRescheduledTemplate(input);

  return sendEmail(
    input.guestEmail,
    "Your booking has been rescheduled",
    html
  );
}