import { Router } from "express";

import { notificationController } from "@/controllers/notificationController";
import { asyncHandler } from "@/utils/errorHandler";

const router = Router();

// POST /api/notifications/send - Send notification
router.post("/send", asyncHandler(notificationController.sendNotification));

// POST /api/notifications/test - Test email configuration
router.post("/test", asyncHandler(notificationController.testEmail));

export { router as notificationRoutes };
