/**
 * Integration tests for Calendar Routes
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
import { calendarRoutes } from "../calendarRoutes";
import { errorHandler } from "@/utils/errorHandler";

describe("Calendar Routes - Integration Tests", () => {
  let app: Express;

  const mockEmployee = {
    id: "emp-1",
    name: "John Doe",
    email: "john@example.com",
    workHours: { start: "08:00", end: "16:30" },
  };

  const mockSettings = {
    workStartTime: "08:00",
    workEndTime: "16:30",
    slotDuration: 60,
    adminEmail: "admin@company.com",
  };

  beforeAll(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/calendar", calendarRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/calendar/timeslots", () => {
    it("should return 200 and time slots for date range", async () => {
      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-15",
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: "Time slots retrieved successfully",
          data: expect.any(Array),
        }),
      );
      expect(mockStorageService.getEmployees).toHaveBeenCalled();
      expect(mockStorageService.getSettings).toHaveBeenCalled();
    });

    it("should filter time slots by employeeId", async () => {
      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-15",
          employeeId: "emp-1",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it("should return 400 when startDate is missing", async () => {
      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          endDate: "2024-01-15",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("startDate and endDate are required");
    });

    it("should return 400 when endDate is missing", async () => {
      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("startDate and endDate are required");
    });

    it("should return 400 for invalid date format", async () => {
      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "invalid-date",
          endDate: "2024-01-15",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid date format");
    });

    it("should return 500 when storage service fails", async () => {
      mockStorageService.getEmployees.mockRejectedValue(new Error("Storage error"));

      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-15",
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to retrieve time slots");
    });
  });

  describe("GET /api/calendar/assignments", () => {
    it("should return 200 and assignments for date range", async () => {
      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement",
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
          status: "scheduled",
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      const response = await request(app)
        .get("/api/calendar/assignments")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-20",
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAssignments,
        message: "Assignments retrieved successfully",
      });
    });

    it("should filter assignments by employeeId", async () => {
      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement",
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
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
          startTime: "2024-01-16T10:00:00.000Z",
          endTime: "2024-01-16T11:00:00.000Z",
          status: "scheduled",
          createdAt: "2024-01-10T11:00:00.000Z",
          updatedAt: "2024-01-10T11:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      const response = await request(app)
        .get("/api/calendar/assignments")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-20",
          employeeId: "emp-1",
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].employeeId).toBe("emp-1");
    });

    it("should return 400 when startDate is missing", async () => {
      const response = await request(app)
        .get("/api/calendar/assignments")
        .query({
          endDate: "2024-01-20",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("startDate and endDate are required");
    });

    it("should return 400 for invalid date format", async () => {
      const response = await request(app)
        .get("/api/calendar/assignments")
        .query({
          startDate: "invalid",
          endDate: "2024-01-20",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid date format");
    });
  });

  describe("GET /api/calendar/employee/:id/schedule", () => {
    it("should return 200 and employee schedule", async () => {
      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement",
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
          status: "scheduled",
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
      ];

      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);
      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      const response = await request(app)
        .get("/api/calendar/employee/emp-1/schedule")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-20",
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          employee: mockEmployee,
          assignments: mockAssignments,
        },
        message: "Employee schedule retrieved successfully",
      });
    });

    it("should work with default date range", async () => {
      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);

      const response = await request(app).get("/api/calendar/employee/emp-1/schedule").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("employee");
      expect(response.body.data).toHaveProperty("assignments");
    });

    it("should return 404 when employee not found", async () => {
      mockStorageService.getEmployeeById.mockResolvedValue(null);

      const response = await request(app).get("/api/calendar/employee/999/schedule").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Employee not found");
    });

    it("should return 400 for invalid date format", async () => {
      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .get("/api/calendar/employee/emp-1/schedule")
        .query({
          startDate: "invalid-date",
          endDate: "2024-01-20",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid date format");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty date range", async () => {
      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-15",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should handle multiple employees", async () => {
      const mockEmployees = [
        mockEmployee,
        {
          id: "emp-2",
          name: "Jane Smith",
          email: "jane@example.com",
          workHours: { start: "09:00", end: "17:30" },
        },
      ];

      mockStorageService.getEmployees.mockResolvedValue(mockEmployees);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      const response = await request(app)
        .get("/api/calendar/timeslots")
        .query({
          startDate: "2024-01-15",
          endDate: "2024-01-15",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
