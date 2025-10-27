import { Request, Response } from "express";

import { CreateWorkAssignmentRequest } from "@/types/types";
import { StorageService } from "@/services/storageService";
import { createError } from "@/utils/errorHandler";

const storage = StorageService.getInstance();

/**
 * Controller object containing all work assignment-related API handlers
 * Provides CRUD operations for work assignments with validation and conflict checking
 *
 * @namespace assignmentController
 * @example
 * import { assignmentController } from "@/controllers/assignmentController";
 * router.get("/assignments", assignmentController.getAllAssignments);
 */
export const assignmentController = {
  /**
   * Retrieves all work assignments from storage
   * Returns a list of all work assignments regardless of status
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 500 if storage retrieval fails
   *
   * @example
   * GET /api/assignments
   * Response: { success: true, data: [...], message: "Work assignments retrieved successfully" }
   */
  getAllAssignments: async (req: Request, res: Response): Promise<void> => {
    try {
      const assignments = await storage.getWorkAssignments();
      res.json({
        success: true,
        data: assignments,
        message: "Work assignments retrieved successfully",
      });
    } catch (error) {
      throw createError("Failed to retrieve work assignments", 500);
    }
  },

  /**
   * Retrieves a single work assignment by ID
   * Validates that the assignment ID is provided and that the assignment exists
   *
   * @param {Request} req - Express request object (expects id in params)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if assignment ID is missing
   * @throws {AppError} 404 if assignment not found
   * @throws {AppError} 500 if storage retrieval fails
   *
   * @example
   * GET /api/assignments/assignment-123
   * Response: { success: true, data: {...}, message: "Work assignment retrieved successfully" }
   */
  getAssignmentById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Assignment ID is required", 400);

      const assignment = await storage.getWorkAssignmentById(id);
      if (!assignment) throw createError("Work assignment not found", 404);

      res.json({
        success: true,
        data: assignment,
        message: "Work assignment retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to retrieve work assignment", 500);
    }
  },

  /**
   * Creates a new work assignment
   * Validates all required fields, work type, employee existence, and time conflicts
   * Automatically sets status to "scheduled"
   *
   * @param {Request} req - Express request object (expects CreateWorkAssignmentRequest in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if required fields are missing or work type is invalid
   * @throws {AppError} 404 if employee not found
   * @throws {AppError} 409 if time slot is already occupied
   * @throws {AppError} 500 if assignment creation fails
   *
   * @example
   * POST /api/assignments
   * Body: {
   *   employeeId: "emp-123",
   *   clientName: "John Doe",
   *   clientPhone: "1234567890",
   *   clientAddress: "123 Main St",
   *   workType: "measurement",
   *   startTime: "2024-01-15T09:00:00Z",
   *   endTime: "2024-01-15T10:00:00Z",
   *   comment: "Initial measurement"
   * }
   * Response: { success: true, data: {...}, message: "Work assignment created successfully" }
   */
  createAssignment: async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentData: CreateWorkAssignmentRequest = req.body;
      const { employeeId, clientName, clientPhone, clientAddress, workType, startTime, endTime, comment } = assignmentData;

      // Validation
      if (!employeeId || !clientName || !clientPhone || !clientAddress || !workType || !startTime || !endTime) {
        throw createError("Missing required fields", 400);
      }

      // Validate work type
      const validWorkTypes = ["measurement", "maintenance", "demolition", "consultation"];
      if (!validWorkTypes.includes(workType)) {
        throw createError("Invalid work type", 400);
      }

      // Check if employee exists
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        throw createError("Employee not found", 404);
      }

      // Check for time conflicts
      const existingAssignments = await storage.getWorkAssignments();
      const hasConflict = existingAssignments.some(
        (assignment) =>
          assignment.employeeId === employeeId &&
          assignment.status === "scheduled" &&
          ((new Date(startTime) >= new Date(assignment.startTime) && new Date(startTime) < new Date(assignment.endTime)) ||
            (new Date(endTime) > new Date(assignment.startTime) && new Date(endTime) <= new Date(assignment.endTime)) ||
            (new Date(startTime) <= new Date(assignment.startTime) && new Date(endTime) >= new Date(assignment.endTime))),
      );

      if (hasConflict) {
        throw createError("Time slot is already occupied", 409);
      }

      const newAssignment = await storage.addWorkAssignment({
        employeeId,
        clientName,
        clientPhone,
        clientAddress,
        workType,
        startTime,
        endTime,
        comment,
        status: "scheduled",
      });

      res.status(201).json({
        success: true,
        data: newAssignment,
        message: "Work assignment created successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to create work assignment", 500);
    }
  },

  /**
   * Updates an existing work assignment
   * Allows partial updates of assignment fields
   * Validates that assignment ID is provided and assignment exists
   *
   * @param {Request} req - Express request object (expects id in params and updates in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if assignment ID is missing or updates are empty
   * @throws {AppError} 404 if assignment not found
   * @throws {AppError} 500 if update operation fails
   *
   * @example
   * PUT /api/assignments/assignment-123
   * Body: { status: "completed", comment: "Job completed successfully" }
   * Response: { success: true, data: {...}, message: "Work assignment updated successfully" }
   */
  updateAssignment: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Assignment ID is required", 400);

      const updates = req.body;
      if (!updates) throw createError("Updates are required", 400);

      const updatedAssignment = await storage.updateWorkAssignment(id, updates);
      if (!updatedAssignment) throw createError("Work assignment not found", 404);

      res.json({
        success: true,
        data: updatedAssignment,
        message: "Work assignment updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to update work assignment", 500);
    }
  },

  /**
   * Deletes a work assignment by ID
   * Validates that assignment ID is provided and assignment exists
   *
   * @param {Request} req - Express request object (expects id in params)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if assignment ID is missing
   * @throws {AppError} 404 if assignment not found
   * @throws {AppError} 500 if deletion operation fails
   *
   * @example
   * DELETE /api/assignments/assignment-123
   * Response: { success: true, message: "Work assignment deleted successfully" }
   */
  deleteAssignment: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Assignment ID is required", 400);

      const deleted = await storage.deleteWorkAssignment(id);
      if (!deleted) throw createError("Work assignment not found", 404);

      res.json({
        success: true,
        message: "Work assignment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to delete work assignment", 500);
    }
  },
};
