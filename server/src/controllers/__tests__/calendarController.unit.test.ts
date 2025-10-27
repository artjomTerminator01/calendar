/**
 * Unit tests for Calendar Controller
 */

import { Request, Response } from "express";
import { StorageService } from "@/services/storageService";

// Mock StorageService BEFORE importing controller
const mockStorageService = {
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  getWorkAssignments: jest.fn(),
  getSettings: jest.fn(),
};

jest.mock("@/services/storageService", () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
}));

// Import controller AFTER mocking
import { calendarController } from "../calendarController";

describe("Calendar Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

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

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      query: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("getTimeSlots", () => {
    it("should return time slots for date range successfully", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-15",
      };

      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      await calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getEmployees).toHaveBeenCalled();
      expect(mockStorageService.getWorkAssignments).toHaveBeenCalled();
      expect(mockStorageService.getSettings).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Time slots retrieved successfully",
          data: expect.any(Array),
        }),
      );
    });

    it("should filter time slots by employeeId", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-15",
        employeeId: "emp-1",
      };

      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      await calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        }),
      );

      // Verify all slots belong to the specified employee
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const slots = responseCall.data;
      expect(slots.every((slot: any) => slot.employeeId === "emp-1")).toBe(true);
    });

    it("should throw error when startDate is missing", async () => {
      mockRequest.query = {
        endDate: "2024-01-15",
      };

      await expect(calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "startDate and endDate are required",
      );
    });

    it("should throw error when endDate is missing", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
      };

      await expect(calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "startDate and endDate are required",
      );
    });

    it("should throw error for invalid date format", async () => {
      mockRequest.query = {
        startDate: "invalid-date",
        endDate: "2024-01-15",
      };

      await expect(calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Invalid date format");
    });

    it("should skip weekends when generating time slots", async () => {
      // Saturday to Sunday range
      mockRequest.query = {
        startDate: "2024-01-13", // Saturday
        endDate: "2024-01-14", // Sunday
      };

      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      await calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const slots = responseCall.data;

      // Should have no slots for weekends
      expect(slots).toHaveLength(0);
    });

    it("should mark occupied slots as unavailable", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-15",
      };

      const mockAssignment = {
        id: "assignment-1",
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

      mockStorageService.getEmployees.mockResolvedValue([mockEmployee]);
      mockStorageService.getWorkAssignments.mockResolvedValue([mockAssignment]);
      mockStorageService.getSettings.mockResolvedValue(mockSettings);

      await calendarController.getTimeSlots(mockRequest as Request, mockResponse as Response);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const slots = responseCall.data;

      // Should have some unavailable slots
      expect(slots.some((slot: any) => !slot.available)).toBe(true);
    });
  });

  describe("getAssignmentsForDateRange", () => {
    it("should return assignments for date range", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-20",
      };

      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement" as const,
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
          status: "scheduled" as const,
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      await calendarController.getAssignmentsForDateRange(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAssignments,
        message: "Assignments retrieved successfully",
      });
    });

    it("should filter assignments by employeeId", async () => {
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        employeeId: "emp-1",
      };

      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement" as const,
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
          status: "scheduled" as const,
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
        {
          id: "2",
          employeeId: "emp-2",
          clientName: "Jane Client",
          clientPhone: "555-5678",
          clientAddress: "456 Oak Ave",
          workType: "maintenance" as const,
          startTime: "2024-01-16T10:00:00.000Z",
          endTime: "2024-01-16T11:00:00.000Z",
          status: "scheduled" as const,
          createdAt: "2024-01-10T11:00:00.000Z",
          updatedAt: "2024-01-10T11:00:00.000Z",
        },
      ];

      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      await calendarController.getAssignmentsForDateRange(mockRequest as Request, mockResponse as Response);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.data).toHaveLength(1);
      expect(responseCall.data[0].employeeId).toBe("emp-1");
    });

    it("should throw error when startDate is missing", async () => {
      mockRequest.query = {
        endDate: "2024-01-20",
      };

      await expect(calendarController.getAssignmentsForDateRange(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "startDate and endDate are required",
      );
    });

    it("should throw error for invalid date format", async () => {
      mockRequest.query = {
        startDate: "invalid",
        endDate: "2024-01-20",
      };

      await expect(calendarController.getAssignmentsForDateRange(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Invalid date format",
      );
    });
  });

  describe("getEmployeeSchedule", () => {
    it("should return employee schedule successfully", async () => {
      mockRequest.params = { id: "emp-1" };
      mockRequest.query = {
        startDate: "2024-01-15",
        endDate: "2024-01-20",
      };

      const mockAssignments = [
        {
          id: "1",
          employeeId: "emp-1",
          clientName: "John Client",
          clientPhone: "555-1234",
          clientAddress: "123 Main St",
          workType: "measurement" as const,
          startTime: "2024-01-16T08:00:00.000Z",
          endTime: "2024-01-16T09:00:00.000Z",
          status: "scheduled" as const,
          createdAt: "2024-01-10T10:00:00.000Z",
          updatedAt: "2024-01-10T10:00:00.000Z",
        },
      ];

      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);
      mockStorageService.getWorkAssignments.mockResolvedValue(mockAssignments);

      await calendarController.getEmployeeSchedule(mockRequest as Request, mockResponse as Response);

      expect(mockStorageService.getEmployeeById).toHaveBeenCalledWith("emp-1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          employee: mockEmployee,
          assignments: mockAssignments,
        },
        message: "Employee schedule retrieved successfully",
      });
    });

    it("should use default date range when not provided", async () => {
      mockRequest.params = { id: "emp-1" };
      mockRequest.query = {};

      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);
      mockStorageService.getWorkAssignments.mockResolvedValue([]);

      await calendarController.getEmployeeSchedule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            employee: mockEmployee,
            assignments: expect.any(Array),
          }),
        }),
      );
    });

    it("should throw error when employee not found", async () => {
      mockRequest.params = { id: "999" };
      mockRequest.query = {};

      mockStorageService.getEmployeeById.mockResolvedValue(null);

      await expect(calendarController.getEmployeeSchedule(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Employee not found");
    });

    it("should throw error for invalid date format", async () => {
      mockRequest.params = { id: "emp-1" };
      mockRequest.query = {
        startDate: "invalid-date",
        endDate: "2024-01-20",
      };

      mockStorageService.getEmployeeById.mockResolvedValue(mockEmployee);

      await expect(calendarController.getEmployeeSchedule(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Invalid date format");
    });
  });
});
