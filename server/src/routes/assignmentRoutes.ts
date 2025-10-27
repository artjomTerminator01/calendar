import { Router } from "express";

import { assignmentController } from "@/controllers/assignmentController";
import { asyncHandler } from "@/utils/errorHandler";

const router = Router();

// GET /api/assignments - Get all work assignments
router.get("/", asyncHandler(assignmentController.getAllAssignments));

// GET /api/assignments/:id - Get assignment by ID
router.get("/:id", asyncHandler(assignmentController.getAssignmentById));

// POST /api/assignments - Create new work assignment
router.post("/", asyncHandler(assignmentController.createAssignment));

// PUT /api/assignments/:id - Update work assignment
router.put("/:id", asyncHandler(assignmentController.updateAssignment));

// DELETE /api/assignments/:id - Delete work assignment
router.delete("/:id", asyncHandler(assignmentController.deleteAssignment));

export { router as assignmentRoutes };
