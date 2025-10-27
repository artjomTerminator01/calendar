/**
 * Test helper utilities
 */

import { Employee, WorkAssignment } from "@/types/types";

/**
 * Factory function to create mock employee data
 */
export const createMockEmployee = (overrides?: Partial<Employee>): Employee => {
  return {
    id: "test-id",
    name: "Test Employee",
    email: "test@example.com",
    workHours: { start: "08:00", end: "16:30" },
    ...overrides,
  };
};

/**
 * Factory function to create mock work assignment data
 */
export const createMockAssignment = (overrides?: Partial<WorkAssignment>): WorkAssignment => {
  return {
    id: "test-assignment-id",
    employeeId: "test-employee-id",
    clientName: "Test Client",
    clientPhone: "+1234567890",
    clientAddress: "123 Test St",
    workType: "measurement",
    startTime: new Date("2024-01-01T10:00:00Z").toISOString(),
    endTime: new Date("2024-01-01T11:00:00Z").toISOString(),
    status: "scheduled",
    comment: "Test comment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create mock Express Request
 */
export const createMockRequest = (overrides?: any) => {
  return {
    params: {},
    body: {},
    query: {},
    headers: {},
    ...overrides,
  };
};

/**
 * Create mock Express Response
 */
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Validate employee data structure
 */
export const isValidEmployee = (employee: any): employee is Employee => {
  return (
    typeof employee === "object" &&
    typeof employee.id === "string" &&
    typeof employee.name === "string" &&
    typeof employee.email === "string" &&
    typeof employee.workHours === "object" &&
    typeof employee.workHours.start === "string" &&
    typeof employee.workHours.end === "string"
  );
};

/**
 * Generate array of mock employees
 */
export const createMockEmployees = (count: number): Employee[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockEmployee({
      id: `employee-${index + 1}`,
      name: `Employee ${index + 1}`,
      email: `employee${index + 1}@example.com`,
    }),
  );
};
