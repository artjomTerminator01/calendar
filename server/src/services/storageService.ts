import fs from "fs-extra";
import path from "path";

import { StorageData, Employee, WorkAssignment, CalendarSettings } from "@/types/types";

const DATA_FILE = path.join(__dirname, "../../data/storage.json");

/**
 * Service class for managing persistent storage using JSON file
 * Implements singleton pattern to ensure single instance across application
 * Handles all CRUD operations for employees, work assignments, and settings
 *
 * @class StorageService
 * @example
 * const storage = StorageService.getInstance();
 * const employees = await storage.getEmployees();
 */
export class StorageService {
  private static instance: StorageService;
  private data: StorageData | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of StorageService
   *
   * @static
   * @returns {StorageService} The singleton StorageService instance
   * @example
   * const storage = StorageService.getInstance();
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Loads data from JSON file into memory
   * Creates initial data structure if file doesn't exist
   * Uses cached data if already loaded
   *
   * @private
   * @returns {Promise<StorageData>} The loaded storage data
   * @throws {Error} If failed to load data from storage
   */
  private async loadData(): Promise<StorageData> {
    if (this.data) {
      return this.data;
    }

    try {
      const fileExists = await fs.pathExists(DATA_FILE);
      if (!fileExists) {
        // Create initial data structure
        const initialData: StorageData = {
          employees: [],
          workAssignments: [],
          settings: {
            workStartTime: "08:00",
            workEndTime: "16:30",
            slotDuration: 60,
            adminEmail: "admin@company.com",
          },
        };
        await this.saveData(initialData);
        this.data = initialData;
        return initialData;
      }

      const fileContent = await fs.readFile(DATA_FILE, "utf-8");
      const parsedData: StorageData = JSON.parse(fileContent);
      this.data = parsedData;
      return parsedData;
    } catch (error) {
      console.error("Error loading data:", error);
      throw new Error("Failed to load data from storage");
    }
  }

  /**
   * Saves data to JSON file and updates cache
   * Ensures directory exists before writing
   *
   * @private
   * @param {StorageData} data - The data to save
   * @returns {Promise<void>}
   * @throws {Error} If failed to save data to storage
   */
  private async saveData(data: StorageData): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(DATA_FILE));
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      this.data = data;
    } catch (error) {
      console.error("Error saving data:", error);
      throw new Error("Failed to save data to storage");
    }
  }

  /**
   * Retrieves all employees from storage
   *
   * @returns {Promise<Employee[]>} Array of all employees
   * @throws {Error} If failed to load data from storage
   * @example
   * const employees = await storage.getEmployees();
   */
  public async getEmployees(): Promise<Employee[]> {
    const data = await this.loadData();
    return data.employees;
  }

  /**
   * Retrieves a single employee by ID
   *
   * @param {string} id - The employee ID
   * @returns {Promise<Employee | null>} The employee if found, null otherwise
   * @throws {Error} If failed to load data from storage
   * @example
   * const employee = await storage.getEmployeeById("emp-123");
   */
  public async getEmployeeById(id: string): Promise<Employee | null> {
    const employees = await this.getEmployees();
    return employees.find((emp) => emp.id === id) || null;
  }

  /**
   * Adds a new employee to storage
   * Automatically generates a unique ID for the employee
   *
   * @param {Omit<Employee, "id">} employee - Employee data without ID
   * @returns {Promise<Employee>} The created employee with generated ID
   * @throws {Error} If failed to save data to storage
   * @example
   * const newEmployee = await storage.addEmployee({
   *   name: "John Doe",
   *   email: "john@example.com",
   *   workHours: { start: "08:00", end: "16:30" }
   * });
   */
  public async addEmployee(employee: Omit<Employee, "id">): Promise<Employee> {
    const data = await this.loadData();
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    data.employees.push(newEmployee);
    await this.saveData(data);
    return newEmployee;
  }

  /**
   * Updates an existing employee's information
   * Allows partial updates of employee fields
   *
   * @param {string} id - The employee ID to update
   * @param {Partial<Employee>} updates - Object containing fields to update
   * @returns {Promise<Employee | null>} The updated employee, or null if not found
   * @throws {Error} If failed to save data to storage
   * @example
   * const updated = await storage.updateEmployee("emp-123", {
   *   name: "Jane Doe",
   *   workHours: { start: "09:00", end: "17:00" }
   * });
   */
  public async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    const data = await this.loadData();
    const employeeIndex = data.employees.findIndex((emp) => emp.id === id);

    if (employeeIndex === -1) {
      return null;
    }

    data.employees[employeeIndex] = {
      ...data.employees[employeeIndex],
      ...updates,
    } as Employee;
    await this.saveData(data);

    return data.employees[employeeIndex] || null;
  }

  /**
   * Deletes an employee from storage
   *
   * @param {string} id - The employee ID to delete
   * @returns {Promise<boolean>} True if deleted successfully, false if employee not found
   * @throws {Error} If failed to save data to storage
   * @example
   * const deleted = await storage.deleteEmployee("emp-123");
   * if (deleted) console.log("Employee deleted");
   */
  public async deleteEmployee(id: string): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.employees.length;
    data.employees = data.employees.filter((emp) => emp.id !== id);

    if (data.employees.length === initialLength) {
      return false;
    }

    await this.saveData(data);
    return true;
  }

  /**
   * Retrieves all work assignments from storage
   *
   * @returns {Promise<WorkAssignment[]>} Array of all work assignments
   * @throws {Error} If failed to load data from storage
   * @example
   * const assignments = await storage.getWorkAssignments();
   */
  public async getWorkAssignments(): Promise<WorkAssignment[]> {
    const data = await this.loadData();
    return data.workAssignments;
  }

  /**
   * Retrieves a single work assignment by ID
   *
   * @param {string} id - The work assignment ID
   * @returns {Promise<WorkAssignment | null>} The work assignment if found, null otherwise
   * @throws {Error} If failed to load data from storage
   * @example
   * const assignment = await storage.getWorkAssignmentById("assignment-123");
   */
  public async getWorkAssignmentById(id: string): Promise<WorkAssignment | null> {
    const assignments = await this.getWorkAssignments();
    return assignments.find((assignment) => assignment.id === id) || null;
  }

  /**
   * Adds a new work assignment to storage
   * Automatically generates unique ID, createdAt, and updatedAt timestamps
   *
   * @param {Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">} assignment - Assignment data without ID and timestamps
   * @returns {Promise<WorkAssignment>} The created work assignment with generated ID and timestamps
   * @throws {Error} If failed to save data to storage
   * @example
   * const newAssignment = await storage.addWorkAssignment({
   *   employeeId: "emp-123",
   *   clientName: "John Doe",
   *   clientPhone: "1234567890",
   *   clientAddress: "123 Main St",
   *   workType: "measurement",
   *   startTime: "2024-01-15T09:00:00Z",
   *   endTime: "2024-01-15T10:00:00Z",
   *   status: "scheduled"
   * });
   */
  public async addWorkAssignment(assignment: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">): Promise<WorkAssignment> {
    const data = await this.loadData();
    const now = new Date().toISOString();

    const newAssignment: WorkAssignment = {
      ...assignment,
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    data.workAssignments.push(newAssignment);
    await this.saveData(data);
    return newAssignment;
  }

  /**
   * Updates an existing work assignment
   * Allows partial updates and automatically updates the updatedAt timestamp
   *
   * @param {string} id - The work assignment ID to update
   * @param {Partial<WorkAssignment>} updates - Object containing fields to update
   * @returns {Promise<WorkAssignment | null>} The updated work assignment, or null if not found
   * @throws {Error} If failed to save data to storage
   * @example
   * const updated = await storage.updateWorkAssignment("assignment-123", {
   *   status: "completed",
   *   comment: "Job completed successfully"
   * });
   */
  public async updateWorkAssignment(id: string, updates: Partial<WorkAssignment>): Promise<WorkAssignment | null> {
    const data = await this.loadData();
    const assignmentIndex = data.workAssignments.findIndex((assignment) => assignment.id === id);

    if (assignmentIndex === -1) {
      return null;
    }

    data.workAssignments[assignmentIndex] = {
      ...data.workAssignments[assignmentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as WorkAssignment;

    await this.saveData(data);
    return data.workAssignments[assignmentIndex] || null;
  }

  /**
   * Deletes a work assignment from storage
   *
   * @param {string} id - The work assignment ID to delete
   * @returns {Promise<boolean>} True if deleted successfully, false if assignment not found
   * @throws {Error} If failed to save data to storage
   * @example
   * const deleted = await storage.deleteWorkAssignment("assignment-123");
   * if (deleted) console.log("Assignment deleted");
   */
  public async deleteWorkAssignment(id: string): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.workAssignments.length;
    data.workAssignments = data.workAssignments.filter((assignment) => assignment.id !== id);

    if (data.workAssignments.length === initialLength) {
      return false;
    }

    await this.saveData(data);
    return true;
  }

  /**
   * Retrieves calendar settings from storage
   *
   * @returns {Promise<CalendarSettings>} The calendar settings object
   * @throws {Error} If failed to load data from storage
   * @example
   * const settings = await storage.getSettings();
   * console.log(settings.workStartTime); // "08:00"
   */
  public async getSettings(): Promise<CalendarSettings> {
    const data = await this.loadData();
    return data.settings;
  }

  /**
   * Updates calendar settings
   * Allows partial updates of settings fields
   *
   * @param {Partial<CalendarSettings>} settings - Object containing settings fields to update
   * @returns {Promise<CalendarSettings>} The updated calendar settings
   * @throws {Error} If failed to save data to storage
   * @example
   * const updated = await storage.updateSettings({
   *   workStartTime: "09:00",
   *   workEndTime: "18:00",
   *   slotDuration: 30
   * });
   */
  public async updateSettings(settings: Partial<CalendarSettings>): Promise<CalendarSettings> {
    const data = await this.loadData();
    data.settings = { ...data.settings, ...settings };
    await this.saveData(data);
    return data.settings;
  }
}
