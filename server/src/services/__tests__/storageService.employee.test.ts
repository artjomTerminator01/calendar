/**
 * Tests for StorageService - Employee methods
 */

import fs from "fs-extra";
import { StorageService } from "../storageService";

// Mock fs-extra
jest.mock("fs-extra");

describe("StorageService - Employee Methods", () => {
  let storageService: StorageService;

  const mockStorageData = {
    employees: [
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
    ],
    workAssignments: [],
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

  describe("getEmployees", () => {
    it("should return all employees", async () => {
      const employees = await storageService.getEmployees();

      expect(employees).toEqual(mockStorageData.employees);
      expect(employees).toHaveLength(2);
    });

    it("should return empty array when no employees exist", async () => {
      (fs.readFile as any) = jest.fn().mockResolvedValue(
        JSON.stringify({
          ...mockStorageData,
          employees: [],
        }),
      );

      const employees = await storageService.getEmployees();

      expect(employees).toEqual([]);
    });
  });

  describe("getEmployeeById", () => {
    it("should return employee by id", async () => {
      const employee = await storageService.getEmployeeById("1");

      expect(employee).toEqual(mockStorageData.employees[0]);
      expect(employee?.id).toBe("1");
    });

    it("should return null when employee not found", async () => {
      const employee = await storageService.getEmployeeById("999");

      expect(employee).toBeNull();
    });
  });

  describe("addEmployee", () => {
    const newEmployeeData = {
      name: "New Employee",
      email: "new@example.com",
      workHours: { start: "08:00", end: "16:30" },
    };

    it("should add new employee successfully", async () => {
      const newEmployee = await storageService.addEmployee(newEmployeeData);

      expect(newEmployee).toMatchObject(newEmployeeData);
      expect(newEmployee.id).toBeDefined();
      expect(typeof newEmployee.id).toBe("string");
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should generate unique ids", async () => {
      const employee1 = await storageService.addEmployee(newEmployeeData);

      // Reset and add another
      (StorageService as any).instance = null;
      storageService = StorageService.getInstance();
      const dataWithEmp1 = {
        ...mockStorageData,
        employees: [...mockStorageData.employees, employee1],
      };
      (fs.readFile as any) = jest.fn().mockResolvedValue(JSON.stringify(dataWithEmp1));

      const employee2 = await storageService.addEmployee({
        ...newEmployeeData,
        email: "another@example.com",
      });

      expect(employee1.id).not.toBe(employee2.id);
    });
  });

  describe("updateEmployee", () => {
    it("should update employee successfully", async () => {
      const updateData = {
        name: "John Updated",
        workHours: { start: "09:00", end: "17:30" },
      };

      const updatedEmployee = await storageService.updateEmployee("1", updateData);

      expect(updatedEmployee).not.toBeNull();
      expect(updatedEmployee?.name).toBe("John Updated");
      expect(updatedEmployee?.workHours.start).toBe("09:00");
      expect(updatedEmployee?.email).toBe("john@example.com"); // Unchanged
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should return null when employee not found", async () => {
      const updatedEmployee = await storageService.updateEmployee("999", { name: "Test" });

      expect(updatedEmployee).toBeNull();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("deleteEmployee", () => {
    it("should delete employee successfully", async () => {
      const result = await storageService.deleteEmployee("1");

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should return false when employee not found", async () => {
      const result = await storageService.deleteEmployee("999");

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("Data Integrity", () => {
    it("should maintain data structure after operations", async () => {
      await storageService.addEmployee({
        name: "Test",
        email: "test@example.com",
        workHours: { start: "08:00", end: "16:30" },
      });

      const writeCall = (fs.writeFile as any).mock.calls[0];
      const savedData = JSON.parse(writeCall?.[1] || "{}");

      expect(savedData).toHaveProperty("employees");
      expect(savedData).toHaveProperty("workAssignments");
      expect(savedData).toHaveProperty("settings");
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
