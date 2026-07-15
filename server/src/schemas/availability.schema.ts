import { z } from "zod";

export const createAvailabilityRuleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),

    startTime: z.string(),

    endTime: z.string(),
  });

  export const updateAvailabilityRuleSchema =
  createAvailabilityRuleSchema;

  export const availabilityIdParamsSchema = z.object({
  id: z.uuid("Invalid availability rule ID"),
});