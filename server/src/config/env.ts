import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  RESEND_API_KEY: z
    .string()
    .min(1, "RESEND_API_KEY is required"),

  EMAIL_FROM: z
    .string()
    .email()
    .or(z.string().startsWith("Calendly Lite <")),

  CLIENT_URL: z
    .string()
    .url("CLIENT_URL must be a valid URL"),

  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);