import { Router } from "express";

import { calendarController } from "@/controllers/calendarController";
import { asyncHandler } from "@/utils/errorHandler";

const router = Router();

// GET /api/calendar/timeslots - Get available time slots
router.get("/timeslots", asyncHandler(calendarController.getTimeSlots));

// GET /api/calendar/assignments - Get assignments for date range
router.get("/assignments", asyncHandler(calendarController.getAssignmentsForDateRange));

// GET /api/calendar/employee/:id/schedule - Get employee schedule
router.get("/employee/:id/schedule", asyncHandler(calendarController.getEmployeeSchedule));

export { router as calendarRoutes };
