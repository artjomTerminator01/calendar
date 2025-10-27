/**
 * Tests for StorageService - Assignment methods
 */

import fs from "fs-extra";
import { StorageService } from "../storageService";

// Mock fs-extra
jest.mock("fs-extra");

describe("StorageService - Assignment Methods", () => {
  let storageService: StorageService;

  const mockStorageData = {
    employees: [
      {
        id: "emp-1",
        name: "John Doe",
        email: "john@example.com",
        workHours: { start: "08:00", end: "16:30" },
      },
    ],
    workAssignments: [
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
        employeeId: "emp-1",
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
    ],
    settings: {
      workStartTime: "08:00",
      workEndTime: "16:30",
      slotDuration: 60,
      adminEmail: "admin@company.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance before each test
    (StorageService as any).instance = null;
    storageService = StorageService.getInstance();

    // Mock file system operations
    (fs.pathExists as any) = jest.fn().mockResolvedValue(true);
    (fs.readFile as any) = jest.fn().mockResolvedValue(JSON.stringify(mockStorageData));
    (fs.ensureDir as any) = jest.fn().mockResolvedValue(undefined);
    (fs.writeFile as any) = jest.fn().mockResolvedValue(undefined);
  });

  describe("getWorkAssignments", () => {
    it("should return all work assignments", async () => {
      const assignments = await storageService.getWorkAssignments();

      expect(assignments).toEqual(mockStorageData.workAssignments);
      expect(assignments).toHaveLength(2);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it("should return empty array when no assignments exist", async () => {
      (fs.readFile as any) = jest.fn().mockResolvedValue(
        JSON.stringify({
          ...mockStorageData,
          workAssignments: [],
        }),
      );

      const assignments = await storageService.getWorkAssignments();

      expect(assignments).toEqual([]);
      expect(assignments).toHaveLength(0);
    });

    it("should handle file read errors", async () => {
      (fs.readFile as any) = jest.fn().mockRejectedValue(new Error("File read error"));

      await expect(storageService.getWorkAssignments()).rejects.toThrow("Failed to load data from storage");
    });
  });

  describe("getWorkAssignmentById", () => {
    it("should return assignment by id", async () => {
      const assignment = await storageService.getWorkAssignmentById("1");

      expect(assignment).toEqual(mockStorageData.workAssignments[0]);
      expect(assignment?.id).toBe("1");
    });

    it("should return null when assignment not found", async () => {
      const assignment = await storageService.getWorkAssignmentById("999");

      expect(assignment).toBeNull();
    });
  });

  describe("addWorkAssignment", () => {
    const newAssignmentData = {
      employeeId: "emp-1",
      clientName: "New Client",
      clientPhone: "555-9999",
      clientAddress: "789 Pine St",
      workType: "consultation" as const,
      startTime: "2024-01-16T08:00:00.000Z",
      endTime: "2024-01-16T09:00:00.000Z",
      status: "scheduled" as const,
    };

    it("should add new assignment successfully", async () => {
      const newAssignment = await storageService.addWorkAssignment(newAssignmentData);

      expect(newAssignment).toMatchObject(newAssignmentData);
      expect(newAssignment.id).toBeDefined();
      expect(newAssignment.createdAt).toBeDefined();
      expect(newAssignment.updatedAt).toBeDefined();
      expect(typeof newAssignment.id).toBe("string");
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should generate unique ids", async () => {
      const assignment1 = await storageService.addWorkAssignment(newAssignmentData);

      // Reset and add another
      (StorageService as any).instance = null;
      storageService = StorageService.getInstance();
      (fs.readFile as any) = jest.fn().mockResolvedValue(
        JSON.stringify({
          ...mockStorageData,
          workAssignments: [...mockStorageData.workAssignments, assignment1],
        }),
      );

      const assignment2 = await storageService.addWorkAssignment({
        ...newAssignmentData,
        clientName: "Another Client",
      });

      expect(assignment1.id).toBeDefined();
      expect(assignment2.id).toBeDefined();
      expect(assignment1.id).not.toBe(assignment2.id);
    });

    it("should set createdAt and updatedAt timestamps", async () => {
      const beforeTime = new Date().toISOString();
      const newAssignment = await storageService.addWorkAssignment(newAssignmentData);
      const afterTime = new Date().toISOString();

      expect(newAssignment.createdAt).toBeDefined();
      expect(newAssignment.updatedAt).toBeDefined();
      expect(newAssignment.createdAt).toBe(newAssignment.updatedAt);
      expect(newAssignment.createdAt >= beforeTime).toBe(true);
      expect(newAssignment.createdAt <= afterTime).toBe(true);
    });

    it("should handle write errors", async () => {
      (fs.writeFile as any) = jest.fn().mockRejectedValue(new Error("Write error"));

      await expect(storageService.addWorkAssignment(newAssignmentData)).rejects.toThrow("Failed to save data to storage");
    });
  });

  describe("updateWorkAssignment", () => {
    const updateData = {
      clientName: "John Updated",
      status: "completed" as const,
    };

    it("should update assignment successfully", async () => {
      const updatedAssignment = await storageService.updateWorkAssignment("1", updateData);

      expect(updatedAssignment).not.toBeNull();
      expect(updatedAssignment?.clientName).toBe("John Updated");
      expect(updatedAssignment?.status).toBe("completed");
      expect(updatedAssignment?.clientPhone).toBe("555-1234"); // Unchanged
      expect(updatedAssignment?.updatedAt).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should update updatedAt timestamp", async () => {
      const beforeTime = new Date().toISOString();
      const updatedAssignment = await storageService.updateWorkAssignment("1", updateData);
      const afterTime = new Date().toISOString();

      expect(updatedAssignment?.updatedAt).toBeDefined();
      expect(updatedAssignment!.updatedAt >= beforeTime).toBe(true);
      expect(updatedAssignment!.updatedAt <= afterTime).toBe(true);
      // createdAt should remain unchanged
      expect(updatedAssignment?.createdAt).toBe("2024-01-10T10:00:00.000Z");
    });

    it("should return null when assignment not found", async () => {
      const updatedAssignment = await storageService.updateWorkAssignment("999", updateData);

      expect(updatedAssignment).toBeNull();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("should handle write errors", async () => {
      (fs.writeFile as any) = jest.fn().mockRejectedValue(new Error("Write error"));

      await expect(storageService.updateWorkAssignment("1", updateData)).rejects.toThrow("Failed to save data to storage");
    });
  });

  describe("deleteWorkAssignment", () => {
    it("should delete assignment successfully", async () => {
      const result = await storageService.deleteWorkAssignment("1");

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();

      // Verify assignment was removed from data
      const writeCall = (fs.writeFile as any).mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData.workAssignments).toHaveLength(1);
      expect(savedData.workAssignments[0]?.id).toBe("2");
    });

    it("should return false when assignment not found", async () => {
      const result = await storageService.deleteWorkAssignment("999");

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("should handle write errors", async () => {
      (fs.writeFile as any) = jest.fn().mockRejectedValue(new Error("Write error"));

      await expect(storageService.deleteWorkAssignment("1")).rejects.toThrow("Failed to save data to storage");
    });
  });

  describe("Singleton Pattern", () => {
    it("should return same instance on multiple calls", () => {
      const instance1 = StorageService.getInstance();
      const instance2 = StorageService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
