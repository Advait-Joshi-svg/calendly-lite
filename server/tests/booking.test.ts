import request from "supertest";
import { DateTime } from "luxon";
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import app from "../src/app.js";
import pool from "../src/db/pool.js";

vi.mock("../src/services/email.service.js", () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendBookingCancelledEmail: vi.fn().mockResolvedValue(undefined),
  sendBookingRescheduledEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Booking API", () => {
  beforeEach(async () => {
    await pool.query(`
      TRUNCATE TABLE
        bookings,
        availability_rules,
        users
      RESTART IDENTITY CASCADE
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates a booking inside the host's availability", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Booking Host",
      email: "booking-host@example.com",
      password: "password123",
      slug: "booking-host",
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "booking-host@example.com",
        password: "password123",
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.token;

    const start = DateTime.now()
      .setZone("America/New_York")
      .plus({ days: 7 })
      .startOf("day")
      .set({ hour: 10, minute: 0 });

    const end = start.plus({ minutes: 30 });

    const dayOfWeek = start.weekday % 7;

    const availabilityResponse = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
      });

    expect(availabilityResponse.status).toBe(201);

    const bookingResponse = await request(app)
      .post("/api/public/booking-host/bookings")
      .send({
        guestName: "Test Guest",
        guestEmail: "guest@example.com",
        startsAt: start.toUTC().toISO(),
        endsAt: end.toUTC().toISO(),
      });

    expect(bookingResponse.status).toBe(201);

    expect(bookingResponse.body).toMatchObject({
      message: "Booking created successfully",
      booking: {
        guestName: "Test Guest",
        guestEmail: "guest@example.com",
      },
    });

    expect(bookingResponse.body.booking.id).toEqual(
      expect.any(String)
    );
  });

  it("rejects an overlapping booking", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Conflict Host",
      email: "conflict-host@example.com",
      password: "password123",
      slug: "conflict-host",
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "conflict-host@example.com",
        password: "password123",
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.token;

    const start = DateTime.now()
      .setZone("America/New_York")
      .plus({ days: 7 })
      .startOf("day")
      .set({ hour: 10, minute: 0 });

    const end = start.plus({ minutes: 30 });

    const dayOfWeek = start.weekday % 7;

    const availabilityResponse = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
      });

    expect(availabilityResponse.status).toBe(201);

    const bookingPayload = {
      guestName: "First Guest",
      guestEmail: "first@example.com",
      startsAt: start.toUTC().toISO(),
      endsAt: end.toUTC().toISO(),
    };

    const firstResponse = await request(app)
      .post("/api/public/conflict-host/bookings")
      .send(bookingPayload);

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app)
      .post("/api/public/conflict-host/bookings")
      .send({
        ...bookingPayload,
        guestName: "Second Guest",
        guestEmail: "second@example.com",
      });

    expect(secondResponse.status).toBe(409);

    expect(secondResponse.body).toEqual({
      message: "This time slot is no longer available",
    });
  });
});