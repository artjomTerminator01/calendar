/**
 * Unit tests for Employee Controller
 */

import { Request, Response } from "express";
import { StorageService } from "@/services/storageService";

// Mock StorageService BEFORE importing controller
const mockStorageService = {
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
};

jest.mock("@/services/storageService", () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
}));

// Import controller AFTER mocking
import { employeeController } from "../employeeController";

describe("Employee Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllEmployees", () => {
    it("should return all employees successfully", async () => {
      const mockEmployees = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          workHours: { start: "08:00", end: "16:30" },
        },
      ];

      mockStorageService.getEmployees.mockResolvedValue(mockEmployees);

      await employeeController.getAllEmployees(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getEmployees).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockEmployees,
        message: "Employees retrieved successfully",
      });
    });

    it("should throw error when storage fails", async () => {
      mockStorageService.getEmployees.mockRejectedValue(new Error("Storage error"));

      await expect(employeeController.getAllEmployees(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Failed to retrieve employees",
      );
    });
  });

  describe("getEmployeeById", () => {
    it("should return employee by id successfully", async () => {
      const mockEmployee = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockRequest.params = { id: "1" };
      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);

      await employeeController.getEmployeeById(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getEmployeeById).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockEmployee,
        message: "Employee retrieved successfully",
      });
    });

    it("should throw error when employee not found", async () => {
      mockRequest.params = { id: "999" };
      mockStorageService.getEmployeeById.mockResolvedValue(null);

      await expect(employeeController.getEmployeeById(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Employee not found");
    });
  });

  describe("createEmployee", () => {
    const validEmployeeData = {
      name: "John Doe",
      email: "john@example.com",
      workHours: { start: "08:00", end: "16:30" },
    };

    it("should create employee successfully", async () => {
      const mockCreatedEmployee = { id: "1", ...validEmployeeData };

      mockRequest.body = validEmployeeData;
      mockStorageService.getEmployees.mockResolvedValue([]);
      mockStorageService.addEmployee.mockResolvedValue(mockCreatedEmployee);

      await employeeController.createEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.addEmployee).toHaveBeenCalledWith(validEmployeeData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedEmployee,
        message: "Employee created successfully",
      });
    });

    it("should throw error when required fields are missing", async () => {
      mockRequest.body = { name: "John Doe" };

      await expect(employeeController.createEmployee(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Missing required fields");
    });

    it("should throw error when email already exists", async () => {
      const existingEmployee = {
        id: "1",
        name: "Existing User",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockRequest.body = validEmployeeData;
      mockStorageService.getEmployees.mockResolvedValue([existingEmployee]);

      await expect(employeeController.createEmployee(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Employee with this email already exists",
      );
    });
  });

  describe("updateEmployee", () => {
    it("should update employee successfully", async () => {
      const updateData = {
        name: "John Updated",
        workHours: { start: "09:00", end: "17:30" },
      };
      const mockUpdatedEmployee = {
        id: "1",
        name: "John Updated",
        email: "john@example.com",
        workHours: { start: "09:00", end: "17:30" },
      };

      mockRequest.params = { id: "1" };
      mockRequest.body = updateData;
      mockStorageService.updateEmployee.mockResolvedValue(mockUpdatedEmployee);

      await employeeController.updateEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.updateEmployee).toHaveBeenCalledWith("1", updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedEmployee,
        message: "Employee updated successfully",
      });
    });

    it("should throw error when employee not found", async () => {
      mockRequest.params = { id: "999" };
      mockRequest.body = { name: "Test" };
      mockStorageService.updateEmployee.mockResolvedValue(null);

      await expect(employeeController.updateEmployee(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Employee not found");
    });
  });

  describe("deleteEmployee", () => {
    it("should delete employee successfully", async () => {
      mockRequest.params = { id: "1" };
      mockStorageService.deleteEmployee.mockResolvedValue(true);

      await employeeController.deleteEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.deleteEmployee).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Employee deleted successfully",
      });
    });

    it("should throw error when employee not found", async () => {
      mockRequest.params = { id: "999" };
      mockStorageService.deleteEmployee.mockResolvedValue(false);

      await expect(employeeController.deleteEmployee(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Employee not found");
    });
  });
});
