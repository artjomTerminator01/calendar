import { Request, Response } from "express";

import { StorageService } from "@/services/storageService";
import { createError } from "@/utils/errorHandler";

const storage = StorageService.getInstance();

/**
 * Controller object containing all employee-related API handlers
 * Provides CRUD operations for employees with validation and duplicate checking
 *
 * @namespace employeeController
 * @example
 * import { employeeController } from "@/controllers/employeeController";
 * router.get("/employees", employeeController.getAllEmployees);
 */
export const employeeController = {
  /**
   * Retrieves all employees from storage
   * Returns a list of all employees with their work hours and contact information
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 500 if storage retrieval fails
   *
   * @example
   * GET /api/employees
   * Response: { success: true, data: [...], message: "Employees retrieved successfully" }
   */
  getAllEmployees: async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await storage.getEmployees();
      res.json({
        success: true,
        data: employees,
        message: "Employees retrieved successfully",
      });
    } catch (error) {
      throw createError("Failed to retrieve employees", 500);
    }
  },

  /**
   * Retrieves a single employee by ID
   * Validates that the employee ID is provided and that the employee exists
   *
   * @param {Request} req - Express request object (expects id in params)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if employee ID is missing
   * @throws {AppError} 404 if employee not found
   * @throws {AppError} 500 if storage retrieval fails
   *
   * @example
   * GET /api/employees/emp-123
   * Response: { success: true, data: {...}, message: "Employee retrieved successfully" }
   */
  getEmployeeById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Employee ID is required", 400);

      const employee = await storage.getEmployeeById(id);
      if (!employee) throw createError("Employee not found", 404);

      res.json({
        success: true,
        data: employee,
        message: "Employee retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to retrieve employee", 500);
    }
  },

  /**
   * Creates a new employee
   * Validates all required fields and checks for duplicate email addresses
   * Automatically generates a unique ID for the employee
   *
   * @param {Request} req - Express request object (expects employee data in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if required fields are missing or work hours are invalid
   * @throws {AppError} 409 if employee with same email already exists
   * @throws {AppError} 500 if employee creation fails
   *
   * @example
   * POST /api/employees
   * Body: {
   *   name: "John Doe",
   *   email: "john@example.com",
   *   workHours: { start: "08:00", end: "16:30" }
   * }
   * Response: { success: true, data: {...}, message: "Employee created successfully" }
   */
  createEmployee: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, workHours } = req.body;

      // Validation
      if (!name || !email || !workHours) {
        throw createError("Missing required fields: name, email, workHours", 400);
      }

      if (!workHours.start || !workHours.end) {
        throw createError("Work hours must include start and end times", 400);
      }

      // Check if employee with same email already exists
      const existingEmployees = await storage.getEmployees();
      const emailExists = existingEmployees.some((emp) => emp.email === email);
      if (emailExists) throw createError("Employee with this email already exists", 409);

      const newEmployee = await storage.addEmployee({
        name,
        email,
        workHours,
      });

      res.status(201).json({
        success: true,
        data: newEmployee,
        message: "Employee created successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to create employee", 500);
    }
  },

  /**
   * Updates an existing employee's information
   * Allows partial updates of employee fields
   * Validates that employee ID is provided and employee exists
   *
   * @param {Request} req - Express request object (expects id in params and updates in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if employee ID is missing
   * @throws {AppError} 404 if employee not found
   * @throws {AppError} 500 if update operation fails
   *
   * @example
   * PUT /api/employees/emp-123
   * Body: { name: "Jane Doe", workHours: { start: "09:00", end: "17:00" } }
   * Response: { success: true, data: {...}, message: "Employee updated successfully" }
   */
  updateEmployee: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Employee ID is required", 400);

      const updates = req.body;

      const updatedEmployee = await storage.updateEmployee(id, updates);
      if (!updatedEmployee) throw createError("Employee not found", 404);

      res.json({
        success: true,
        data: updatedEmployee,
        message: "Employee updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to update employee", 500);
    }
  },

  /**
   * Deletes an employee by ID
   * Validates that employee ID is provided and employee exists
   * Note: This will also affect any work assignments associated with this employee
   *
   * @param {Request} req - Express request object (expects id in params)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if employee ID is missing
   * @throws {AppError} 404 if employee not found
   * @throws {AppError} 500 if deletion operation fails
   *
   * @example
   * DELETE /api/employees/emp-123
   * Response: { success: true, message: "Employee deleted successfully" }
   */
  deleteEmployee: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Employee ID is required", 400);

      const deleted = await storage.deleteEmployee(id);
      if (!deleted) throw createError("Employee not found", 404);

      res.json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to delete employee", 500);
    }
  },
};
