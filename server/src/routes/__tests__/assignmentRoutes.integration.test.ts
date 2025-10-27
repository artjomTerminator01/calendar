/**
 * Integration tests for Assignment Routes
 */

// Mock StorageService BEFORE any imports
const mockStorageService = {
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
  getWorkAssignments: jest.fn(),
  getWorkAssignmentById: jest.fn(),
  addWorkAssignment: jest.fn(),
  updateWorkAssignment: jest.fn(),
  deleteWorkAssignment: jest.fn(),
  getSettings: jest.fn(),
};

jest.mock("@/services/storageService", () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
}));

import request from "supertest";
import express, { Express } from "express";
import { assignmentRoutes } from "../assignmentRoutes";
import { errorHandler } from "@/utils/errorHandler";

describe("Assignment Routes - Integration Tests", () => {
  let app: Express;

  beforeAll(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/assignments", assignmentRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/assignments", () => {
    it("should return 200 and all assignments", async () => {
      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement",
          startTime: "2024-01-15T08:00:00.000Z",
          endTime: "2024-01-15T09:00:00.000Z",
          status: "scheduled",
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
        {
          id: "2",
          employeeId: "emp-2",
          clientName: "Jane Client",
          clientPhone: "555-5678",
          clientAddress: "456 Oak Ave",
          workType: "maintenance",
          startTime: "2024-01-15T10:00:00.000Z",
          endTime: "2024-01-15T11:00:00.000Z",
          status: "completed",
          createdAt: "2024-01-10T11:00:00.000Z",
          updatedAt: "2024-01-11T11:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      const response = await request(app).get("/api/assignments").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAssignments,
        message: "Work assignments retrieved successfully",
      });
      expect(mockStorageService.getWorkAssignments).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when storage service fails", async () => {
      mockStorageService.getWorkAssignments.mockRejectedValue(new Error("Storage error"));

      const response = await request(app).get("/api/assignments").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to retrieve work assignments");
    });
  });

  describe("GET /api/assignments/:id", () => {
    it("should return 200 and assignment by id", async () => {
      const mockAssignment = {
        id: "1",
        employeeId: "emp-1",
        clientName: "John Client",
        clientPhone: "555-1234",
        clientAddress: "123 Main St",
        workType: "measurement",
        startTime: "2024-01-15T08:00:00.000Z",
        endTime: "2024-01-15T09:00:00.000Z",
        status: "scheduled",
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-10T10:00:00.000Z",
      };

      mockStorageService.getWorkAssignmentById.mockResolvedValue(mockAssignment);

      const response = await request(app).get("/api/assignments/1").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAssignment,
        message: "Work assignment retrieved successfully",
      });
      expect(mockStorageService.getWorkAssignmentById).toHaveBeenCalledWith("1");
    });

    it("should return 404 when assignment not found", async () => {
      mockStorageService.getWorkAssignmentById.mockResolvedValue(null);

      const response = await request(app).get("/api/assignments/999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Work assignment not found");
    });
  });

  describe("POST /api/assignments", () => {
    const validAssignmentData = {
      employeeId: "emp-1",
      clientName: "John Client",
      clientPhone: "555-1234",
      clientAddress: "123 Main St",
      workType: "measurement",
      startTime: "2024-01-15T08:00:00.000Z",
      endTime: "2024-01-15T09:00:00.000Z",
    };

    it("should return 201 and create assignment successfully", async () => {
      const mockCreatedAssignment = {
        id: "1",
        ...validAssignmentData,
        status: "scheduled",
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-10T10:00:00.000Z",
      };

      mockStorageService.getEmployeeById.mockResolvedValue({
        id: "emp-1",
        name: "Test Employee",
        email: "test@example.com",
        workHours: { start: "08:00", end: "16:30" },
      });
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.addWorkAssignment.mockResolvedValue(mockCreatedAssignment);

      const response = await request(app).post("/api/assignments").send(validAssignmentData).expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockCreatedAssignment,
        message: "Work assignment created successfully",
      });
      expect(mockStorageService.addWorkAssignment).toHaveBeenCalledWith({
        ...validAssignmentData,
        status: "scheduled",
      });
    });

    it("should return 400 when required fields are missing", async () => {
      const invalidData = {
        clientName: "John Client",
        // Missing required fields
      };

      const response = await request(app).post("/api/assignments").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should return 400 when work type is invalid", async () => {
      const invalidData = {
        ...validAssignmentData,
        workType: "invalid-type",
      };

      const response = await request(app).post("/api/assignments").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid work type");
    });

    it("should return 404 when employee not found", async () => {
      mockStorageService.getEmployeeById.mockResolvedValue(null);

      const response = await request(app).post("/api/assignments").send(validAssignmentData).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Employee not found");
      expect(mockStorageService.addWorkAssignment).not.toHaveBeenCalled();
    });

    it("should return 409 when time slot conflicts", async () => {
      const existingAssignment = {
        id: "2",
        employeeId: "emp-1",
        clientName: "Jane Client",
        clientPhone: "555-5678",
        clientAddress: "456 Oak Ave",
        workType: "maintenance",
        startTime: "2024-01-15T08:30:00.000Z",
        endTime: "2024-01-15T09:30:00.000Z",
        status: "scheduled",
        createdAt: "2024-01-09T10:00:00.000Z",
        updatedAt: "2024-01-09T10:00:00.000Z",
      };

      mockStorageService.getEmployeeById.mockResolvedValue({ id: "emp-1" });
      mockStorageService.getWorkAssignments.mockResolvedValue([existingAssignment]);

      const response = await request(app).post("/api/assignments").send(validAssignmentData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Time slot is already occupied");
      expect(mockStorageService.addWorkAssignment).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/assignments/:id", () => {
    const updateData = {
      clientName: "John Updated",
      status: "completed",
    };

    it("should return 200 and update assignment successfully", async () => {
      const mockUpdatedAssignment = {
        id: "1",
        employeeId: "emp-1",
        clientName: "John Updated",
        clientPhone: "555-1234",
        clientAddress: "123 Main St",
        workType: "measurement",
        startTime: "2024-01-15T08:00:00.000Z",
        endTime: "2024-01-15T09:00:00.000Z",
        status: "completed",
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-12T10:00:00.000Z",
      };

      mockStorageService.updateWorkAssignment.mockResolvedValue(mockUpdatedAssignment);

      const response = await request(app).put("/api/assignments/1").send(updateData).expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedAssignment,
        message: "Work assignment updated successfully",
      });
      expect(mockStorageService.updateWorkAssignment).toHaveBeenCalledWith("1", updateData);
    });

    it("should return 404 when assignment not found", async () => {
      mockStorageService.updateWorkAssignment.mockResolvedValue(null);

      const response = await request(app).put("/api/assignments/999").send(updateData).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Work assignment not found");
    });

    it("should allow partial updates", async () => {
      const partialUpdate = { status: "cancelled" };
      const mockUpdatedAssignment = {
        id: "1",
        employeeId: "emp-1",
        clientName: "John Client",
        clientPhone: "555-1234",
        clientAddress: "123 Main St",
        workType: "measurement",
        startTime: "2024-01-15T08:00:00.000Z",
        endTime: "2024-01-15T09:00:00.000Z",
        status: "cancelled",
        createdAt: "2024-01-10T10:00:00.000Z",
        updatedAt: "2024-01-12T10:00:00.000Z",
      };

      mockStorageService.updateWorkAssignment.mockResolvedValue(mockUpdatedAssignment);

      const response = await request(app).put("/api/assignments/1").send(partialUpdate).expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStorageService.updateWorkAssignment).toHaveBeenCalledWith("1", partialUpdate);
    });
  });

  describe("DELETE /api/assignments/:id", () => {
    it("should return 200 and delete assignment successfully", async () => {
      mockStorageService.deleteWorkAssignment.mockResolvedValue(true);

      const response = await request(app).delete("/api/assignments/1").expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Work assignment deleted successfully",
      });
      expect(mockStorageService.deleteWorkAssignment).toHaveBeenCalledWith("1");
    });

    it("should return 404 when assignment not found", async () => {
      mockStorageService.deleteWorkAssignment.mockResolvedValue(false);

      const response = await request(app).delete("/api/assignments/999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Work assignment not found");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app).post("/api/assignments").set("Content-Type", "application/json").send("{ invalid json }").expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle empty request body for POST", async () => {
      const response = await request(app).post("/api/assignments").send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });
  });
});
