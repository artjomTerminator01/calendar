/**
 * Integration tests for Employee Routes
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
import { employeeRoutes } from "../employeeRoutes";
import { errorHandler } from "@/utils/errorHandler";

describe("Employee Routes - Integration Tests", () => {
  let app: Express;

  beforeAll(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/employees", employeeRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/employees", () => {
    it("should return 200 and all employees", async () => {
      const mockEmployees = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          workHours: { start: "08:00", end: "16:30" },
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          workHours: { start: "09:00", end: "17:30" },
        },
      ];

      mockStorageService.getEmployees.mockResolvedValue(mockEmployees);

      const response = await request(app).get("/api/employees").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockEmployees,
        message: "Employees retrieved successfully",
      });
      expect(mockStorageService.getEmployees).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when storage service fails", async () => {
      mockStorageService.getEmployees.mockRejectedValue(new Error("Storage error"));

      const response = await request(app).get("/api/employees").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to retrieve employees");
    });
  });

  describe("GET /api/employees/:id", () => {
    it("should return 200 and employee by id", async () => {
      const mockEmployee = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);

      const response = await request(app).get("/api/employees/1").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockEmployee,
        message: "Employee retrieved successfully",
      });
      expect(mockStorageService.getEmployeeById).toHaveBeenCalledWith("1");
    });

    it("should return 404 when employee not found", async () => {
      mockStorageService.getEmployeeById.mockResolvedValue(null);

      const response = await request(app).get("/api/employees/999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Employee not found");
    });
  });

  describe("POST /api/employees", () => {
    const validEmployeeData = {
      name: "John Doe",
      email: "john@example.com",
      workHours: { start: "08:00", end: "16:30" },
    };

    it("should return 201 and create employee successfully", async () => {
      const mockCreatedEmployee = {
        id: "1",
        ...validEmployeeData,
      };

      mockStorageService.getEmployees.mockResolvedValue([]);
      mockStorageService.addEmployee.mockResolvedValue(mockCreatedEmployee);

      const response = await request(app).post("/api/employees").send(validEmployeeData).expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockCreatedEmployee,
        message: "Employee created successfully",
      });
      expect(mockStorageService.addEmployee).toHaveBeenCalledWith(validEmployeeData);
    });

    it("should return 400 when required fields are missing", async () => {
      const invalidData = {
        name: "John Doe",
        // Missing email and workHours
      };

      const response = await request(app).post("/api/employees").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should return 400 when work hours are incomplete", async () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        workHours: { start: "08:00" }, // Missing end
      };

      const response = await request(app).post("/api/employees").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Work hours must include");
    });

    it("should return 409 when email already exists", async () => {
      const existingEmployee = {
        id: "1",
        name: "Existing User",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockStorageService.getEmployees.mockResolvedValue([existingEmployee]);

      const response = await request(app).post("/api/employees").send(validEmployeeData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("email already exists");
      expect(mockStorageService.addEmployee).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/employees/:id", () => {
    const updateData = {
      name: "John Updated",
      workHours: { start: "09:00", end: "17:30" },
    };

    it("should return 200 and update employee successfully", async () => {
      const mockUpdatedEmployee = {
        id: "1",
        name: "John Updated",
        email: "john@example.com",
        workHours: { start: "09:00", end: "17:30" },
      };

      mockStorageService.updateEmployee.mockResolvedValue(mockUpdatedEmployee);

      const response = await request(app).put("/api/employees/1").send(updateData).expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedEmployee,
        message: "Employee updated successfully",
      });
      expect(mockStorageService.updateEmployee).toHaveBeenCalledWith("1", updateData);
    });

    it("should return 404 when employee not found", async () => {
      mockStorageService.updateEmployee.mockResolvedValue(null);

      const response = await request(app).put("/api/employees/999").send(updateData).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Employee not found");
    });

    it("should allow partial updates", async () => {
      const partialUpdate = { name: "John Updated" };
      const mockUpdatedEmployee = {
        id: "1",
        name: "John Updated",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockStorageService.updateEmployee.mockResolvedValue(mockUpdatedEmployee);

      const response = await request(app).put("/api/employees/1").send(partialUpdate).expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStorageService.updateEmployee).toHaveBeenCalledWith("1", partialUpdate);
    });
  });

  describe("DELETE /api/employees/:id", () => {
    it("should return 200 and delete employee successfully", async () => {
      mockStorageService.deleteEmployee.mockResolvedValue(true);

      const response = await request(app).delete("/api/employees/1").expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Employee deleted successfully",
      });
      expect(mockStorageService.deleteEmployee).toHaveBeenCalledWith("1");
    });

    it("should return 404 when employee not found", async () => {
      mockStorageService.deleteEmployee.mockResolvedValue(false);

      const response = await request(app).delete("/api/employees/999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Employee not found");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app).post("/api/employees").set("Content-Type", "application/json").send("{ invalid json }").expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle empty request body for POST", async () => {
      const response = await request(app).post("/api/employees").send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should validate email format implicitly through unique check", async () => {
      const dataWithInvalidEmail = {
        name: "John Doe",
        email: "not-an-email",
        workHours: { start: "08:00", end: "16:30" },
      };

      mockStorageService.getEmployees.mockResolvedValue([]);
      mockStorageService.addEmployee.mockResolvedValue({
        id: "1",
        ...dataWithInvalidEmail,
      });

      // Note: Current implementation doesn't validate email format
      // This test documents current behavior
      const response = await request(app).post("/api/employees").send(dataWithInvalidEmail).expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
