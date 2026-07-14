import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorizationHeader =
    request.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authorizationHeader.slice(
    "Bearer ".length
  );

  if (!token) {
    return response.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    request.userId = payload.userId;

    next();
  } catch {
    return response.status(401).json({
      message: "Invalid or expired token",
    });
  }
}