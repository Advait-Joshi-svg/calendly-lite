import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import pool from "../src/db/pool.js";

describe("Authentication API", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /health", () => {
    it("returns 200 and status ok", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "ok",
      });
    });
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          slug: "test-user",
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        user: {
          name: "Test User",
          email: "test@example.com",
          slug: "test-user",
        },
      });

      expect(response.body.user).not.toHaveProperty("passwordHash");
    });
  });

  describe("POST /api/auth/login", () => {
  it("logs in a registered user and returns a token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email: "login@example.com",
      password: "password123",
      slug: "login-test",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));

    expect(response.body).toMatchObject({
      user: {
        name: "Login Test",
        email: "login@example.com",
        slug: "login-test",
      },
    });
  });

  it("rejects an incorrect password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Invalid Login Test",
      email: "invalid-login@example.com",
      password: "password123",
      slug: "invalid-login-test",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "invalid-login@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });
});
});