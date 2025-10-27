import { Router } from "express";

import { employeeController } from "@/controllers/employeeController";
import { asyncHandler } from "@/utils/errorHandler";

const router = Router();

// GET /api/employees - Get all employees
router.get("/", asyncHandler(employeeController.getAllEmployees));

// GET /api/employees/:id - Get employee by ID
router.get("/:id", asyncHandler(employeeController.getEmployeeById));

// POST /api/employees - Create new employee
router.post("/", asyncHandler(employeeController.createEmployee));

// PUT /api/employees/:id - Update employee
router.put("/:id", asyncHandler(employeeController.updateEmployee));

// DELETE /api/employees/:id - Delete employee
router.delete("/:id", asyncHandler(employeeController.deleteEmployee));

export { router as employeeRoutes };
