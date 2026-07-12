import { z } from "zod";

export const registerSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  slug: z.string(),
});