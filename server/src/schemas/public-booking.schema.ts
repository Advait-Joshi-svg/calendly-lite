import { z } from "zod";

export const getPublicSlotsParamsSchema = z.object({
  slug: z.string().min(1),
});

export const getPublicSlotsQuerySchema = z.object({
  date: z.iso.date(),
});

