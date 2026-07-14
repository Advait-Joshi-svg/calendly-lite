import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../types/jwt.js";

export function createAccessToken(userId: string): string {
  const payload: AccessTokenPayload = {
    userId,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: decoded.userId,
  };
}