/**
 * Unit tests for Assignment Controller
 */

import { Request, Response } from "express";
import { StorageService } from "@/services/storageService";

// Mock StorageService BEFORE importing controller
const mockStorageService = {
  getWorkAssignments: jest.fn(),
  getWorkAssignmentById: jest.fn(),
  addWorkAssignment: jest.fn(),
  updateWorkAssignment: jest.fn(),
  deleteWorkAssignment: jest.fn(),
  getEmployeeById: jest.fn(),
};

jest.mock("@/services/storageService", () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
}));

// Import controller AFTER mocking
import { assignmentController } from "../assignmentController";

describe("Assignment Controller - Unit Tests", () => {
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

  describe("getAllAssignments", () => {
    it("should return all assignments successfully", async () => {
      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement" as const,
          startTime: "2024-01-15T08:00:00.000Z",
          endTime: "2024-01-15T09:00:00.000Z",
          status: "scheduled" as const,
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      await assignmentController.getAllAssignments(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getWorkAssignments).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAssignments,
        message: "Work assignments retrieved successfully",
      });
    });

    it("should throw error when storage fails", async () => {
      mockStorageService.getWorkAssignments.mockRejectedValue(new Error("Storage error"));

      await expect(assignmentController.getAllAssignments(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Failed to retrieve work assignments",
      );
    });
  });

  describe("getAssignmentById", () => {
    it("should return assignment by id successfully", async () => {
      const mockAssignment = {
        id: "1",
        employeeId: "emp-1",
        clientName: "John Client",
        clientPhone: "555-1234",
        clientAddress: "123 Main St",
        workType: "measurement" as const,
        startTime: "2024-01-15T08:00:00.000Z",
        endTime: "2024-01-15T09:00:00.000Z",
        status: "scheduled" as const,
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-10T10:00:00.000Z",
      };

      mockRequest.params = { id: "1" };
      mockStorageService.getWorkAssignmentById.mockResolvedValue(mockAssignment);

      await assignmentController.getAssignmentById(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getWorkAssignmentById).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAssignment,
        message: "Work assignment retrieved successfully",
      });
    });

    it("should throw error when assignment not found", async () => {
      mockRequest.params = { id: "999" };
      mockStorageService.getWorkAssignmentById.mockResolvedValue(null);

      await expect(assignmentController.getAssignmentById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Work assignment not found",
      );
    });
  });

  describe("createAssignment", () => {
    const validAssignmentData = {
      employeeId: "emp-1",
      clientName: "John Client",
      clientPhone: "555-1234",
      clientAddress: "123 Main St",
      workType: "measurement" as const,
      startTime: "2024-01-15T08:00:00.000Z",
      endTime: "2024-01-15T09:00:00.000Z",
    };

    it("should create assignment successfully", async () => {
      const mockCreatedAssignment = {
        id: "1",
        ...validAssignmentData,
        status: "scheduled" as const,
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-10T10:00:00.000Z",
      };

      mockRequest.body = validAssignmentData;
      mockStorageService.getEmployeeById.mockResolvedValue({
        id: "emp-1",
        name: "Test Employee",
        email: "test@example.com",
        workHours: { start: "08:00", end: "16:30" },
      });
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.addWorkAssignment.mockResolvedValue(mockCreatedAssignment);

      await assignmentController.createAssignment(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.addWorkAssignment).toHaveBeenCalledWith({
        ...validAssignmentData,
        status: "scheduled",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedAssignment,
        message: "Work assignment created successfully",
      });
    });

    it("should throw error when required fields are missing", async () => {
      mockRequest.body = { clientName: "John Client" };

      await expect(assignmentController.createAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Missing required fields",
      );
    });

    it("should throw error when work type is invalid", async () => {
      mockRequest.body = {
        ...validAssignmentData,
        workType: "invalid-type",
      };

      await expect(assignmentController.createAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Invalid work type");
    });

    it("should throw error when employee not found", async () => {
      mockRequest.body = validAssignmentData;
      mockStorageService.getEmployeeById.mockResolvedValue(null);

      await expect(assignmentController.createAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Employee not found");
    });

    it("should throw error when time slot conflicts", async () => {
      const existingAssignment = {
        id: "2",
        employeeId: "emp-1",
        clientName: "Jane Client",
        clientPhone: "555-5678",
        clientAddress: "456 Oak Ave",
        workType: "maintenance" as const,
        startTime: "2024-01-15T08:30:00.000Z",
        endTime: "2024-01-15T09:30:00.000Z",
        status: "scheduled" as const,
        createdAt: "2024-01-09T10:00:00.000Z",
        updatedAt: "2024-01-09T10:00:00.000Z",
      };

      mockRequest.body = validAssignmentData;
      mockStorageService.getEmployeeById.mockResolvedValue({ id: "emp-1" });
      mockStorageService.getWorkAssignments.mockResolvedValue([existingAssignment]);

      await expect(assignmentController.createAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Time slot is already occupied",
      );
    });
  });

  describe("updateAssignment", () => {
    const updateData = {
      clientName: "John Updated",
      status: "completed" as const,
    };

    it("should update assignment successfully", async () => {
      const mockUpdatedAssignment = {
        id: "1",
        employeeId: "emp-1",
        clientName: "John Updated",
        clientPhone: "555-1234",
        clientAddress: "123 Main St",
        workType: "measurement" as const,
        startTime: "2024-01-15T08:00:00.000Z",
        endTime: "2024-01-15T09:00:00.000Z",
        status: "completed" as const,
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-12T10:00:00.000Z",
      };

      mockRequest.params = { id: "1" };
      mockRequest.body = updateData;
      mockStorageService.updateWorkAssignment.mockResolvedValue(mockUpdatedAssignment);

      await assignmentController.updateAssignment(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.updateWorkAssignment).toHaveBeenCalledWith("1", updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedAssignment,
        message: "Work assignment updated successfully",
      });
    });

    it("should throw error when assignment not found", async () => {
      mockRequest.params = { id: "999" };
      mockRequest.body = updateData;
      mockStorageService.updateWorkAssignment.mockResolvedValue(null);

      await expect(assignmentController.updateAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Work assignment not found",
      );
    });
  });

  describe("deleteAssignment", () => {
    it("should delete assignment successfully", async () => {
      mockRequest.params = { id: "1" };
      mockStorageService.deleteWorkAssignment.mockResolvedValue(true);

      await assignmentController.deleteAssignment(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.deleteWorkAssignment).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Work assignment deleted successfully",
      });
    });

    it("should throw error when assignment not found", async () => {
      mockRequest.params = { id: "999" };
      mockStorageService.deleteWorkAssignment.mockResolvedValue(false);

      await expect(assignmentController.deleteAssignment(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Work assignment not found",
      );
    });
  });
});
