import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(userId: string): string {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}