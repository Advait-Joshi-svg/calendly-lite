import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorizationHeader = request.headers.authorization;
  if (
  !authorizationHeader ||
  !authorizationHeader.startsWith("Bearer ")
) {
  return response.status(401).json({
    message: "Authentication required",
  });
}
const token = authorizationHeader.slice("Bearer ".length);

if (!token) {
  return response.status(401).json({
    message: "Authentication required",
  });
}

try {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (
  typeof decoded === "string" ||
  typeof decoded.userId !== "string"
) {
  return response.status(401).json({
    message: "Invalid token payload",
  });
}
  request.userId = decoded.userId;
  next();
} catch {
  return response.status(401).json({
    message: "Invalid or expired token",
  });
}
}