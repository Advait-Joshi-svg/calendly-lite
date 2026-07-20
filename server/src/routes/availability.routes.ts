import type { Response } from "express";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createAvailabilityRule,
  getAvailabilityRulesByUserId,
  updateAvailabilityRule,
  deleteAvailabilityRule,
} from "../models/availability.model.js";
import {
  availabilityIdParamsSchema,
  createAvailabilityRuleSchema,
  updateAvailabilityRuleSchema,
} from "../schemas/availability.schema.js";

const router = Router();

router.post("/", requireAuth, async (request, response) => {
  const body = createAvailabilityRuleSchema.parse(request.body);

  const availability = await createAvailabilityRule({
    userId: request.userId!,
    dayOfWeek: body.dayOfWeek,
    startTime: body.startTime,
    endTime: body.endTime,
  });

  return response.status(201).json({
    message: "Availability created successfully",
    availability,
  });
});

router.get("/", requireAuth, async (request, response) => {
  const availability = await getAvailabilityRulesByUserId(
    request.userId!
  );

  return response.status(200).json({
    availability,
  });
});

router.patch("/:id", requireAuth, async (request, response) => {
  const { id } = availabilityIdParamsSchema.parse(request.params);

  const body = updateAvailabilityRuleSchema.parse(request.body);

  const availability = await updateAvailabilityRule({
    id,
    userId: request.userId!,
    dayOfWeek: body.dayOfWeek,
    startTime: body.startTime,
    endTime: body.endTime,
  });

  if (!availability) {
    return response.status(404).json({
      message: "Availability rule not found",
    });
  }

  return response.status(200).json({
    message: "Availability updated successfully",
    availability,
  });
});

router.delete("/:id", requireAuth, async (request, response) => {
  const { id } = availabilityIdParamsSchema.parse(request.params);

  const deletedAvailability = await deleteAvailabilityRule(
    id,
    request.userId!
  );

  if (!deletedAvailability) {
    return response.status(404).json({
      message: "Availability rule not found",
    });
  }

  return response.status(200).json({
    message: "Availability deleted successfully",
    availability: deletedAvailability,
  });
});

export default router;