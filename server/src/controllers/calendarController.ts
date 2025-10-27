import { Request, Response } from "express";

import { TimeSlot, WorkAssignment } from "@/types/types";
import { StorageService } from "@/services/storageService";
import { createError } from "@/utils/errorHandler";

const storage = StorageService.getInstance();

/**
 * Controller object containing all calendar-related API handlers
 * Provides time slot generation, assignment filtering, and employee schedule management
 * Handles date range queries and weekend filtering for business operations
 *
 * @namespace calendarController
 * @example
 * import { calendarController } from "@/controllers/calendarController";
 * router.get("/calendar/timeslots", calendarController.getTimeSlots);
 */
export const calendarController = {
  /**
   * Generates available time slots for a date range
   * Skips weekends and checks for assignment conflicts
   * Can filter by specific employee or return slots for all employees
   *
   * @param {Request} req - Express request object (expects query params: startDate, endDate, employeeId?)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if startDate/endDate are missing or invalid format
   * @throws {AppError} 500 if time slot generation fails
   *
   * @example
   * GET /api/calendar/timeslots?startDate=2024-01-15&endDate=2024-01-19&employeeId=emp-123
   * Response: { success: true, data: [...], message: "Time slots retrieved successfully" }
   */
  getTimeSlots: async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw createError("startDate and endDate are required", 400);
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw createError("Invalid date format", 400);
      }

      const employees = await storage.getEmployees();
      const assignments = await storage.getWorkAssignments();
      const settings = await storage.getSettings();

      const timeSlots: TimeSlot[] = [];

      // Generate time slots for each day in the range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const targetEmployees = employeeId ? employees.filter((emp) => emp.id === employeeId) : employees;

          for (const employee of targetEmployees) {
            const slots = generateTimeSlotsForDay(currentDate, employee, settings, assignments);
            timeSlots.push(...slots);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json({
        success: true,
        data: timeSlots,
        message: "Time slots retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to retrieve time slots", 500);
    }
  },

  /**
   * Retrieves work assignments within a specific date range
   * Filters assignments that overlap with the given date range
   * Can optionally filter by specific employee
   *
   * @param {Request} req - Express request object (expects query params: startDate, endDate, employeeId?)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if startDate/endDate are missing or invalid format
   * @throws {AppError} 500 if assignment retrieval fails
   *
   * @example
   * GET /api/calendar/assignments?startDate=2024-01-15&endDate=2024-01-19&employeeId=emp-123
   * Response: { success: true, data: [...], message: "Assignments retrieved successfully" }
   */
  getAssignmentsForDateRange: async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, employeeId } = req.query;

      if (!startDate || !endDate) {
        throw createError("startDate and endDate are required", 400);
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw createError("Invalid date format", 400);
      }

      const allAssignments = await storage.getWorkAssignments();

      let filteredAssignments = allAssignments.filter((assignment) => {
        const assignmentStart = new Date(assignment.startTime);
        const assignmentEnd = new Date(assignment.endTime);

        return (
          (assignmentStart >= start && assignmentStart <= end) ||
          (assignmentEnd >= start && assignmentEnd <= end) ||
          (assignmentStart <= start && assignmentEnd >= end)
        );
      });

      if (employeeId) {
        filteredAssignments = filteredAssignments.filter((assignment) => assignment.employeeId === employeeId);
      }

      res.json({
        success: true,
        data: filteredAssignments,
        message: "Assignments retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to retrieve assignments", 500);
    }
  },

  /**
   * Retrieves an employee's schedule for a specific date range
   * Returns employee information along with their assignments
   * Uses default date range (current week) if not specified
   *
   * @param {Request} req - Express request object (expects id in params, startDate/endDate in query)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if employee ID is missing or date format is invalid
   * @throws {AppError} 404 if employee not found
   * @throws {AppError} 500 if schedule retrieval fails
   *
   * @example
   * GET /api/calendar/employee/emp-123/schedule?startDate=2024-01-15&endDate=2024-01-19
   * Response: { success: true, data: { employee: {...}, assignments: [...] }, message: "Employee schedule retrieved successfully" }
   */
  getEmployeeSchedule: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw createError("Employee ID is required", 400);
      const { startDate, endDate } = req.query;

      const employee = await storage.getEmployeeById(id);
      if (!employee) throw createError("Employee not found", 404);

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to next week

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw createError("Invalid date format", 400);
      }

      const allAssignments = await storage.getWorkAssignments();
      const employeeAssignments = allAssignments.filter((assignment) => {
        const assignmentStart = new Date(assignment.startTime);
        return assignment.employeeId === id && assignmentStart >= start && assignmentStart <= end;
      });

      res.json({
        success: true,
        data: {
          employee,
          assignments: employeeAssignments,
        },
        message: "Employee schedule retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to retrieve employee schedule", 500);
    }
  },
};

/**
 * Generates time slots for a specific day and employee
 * Creates hourly slots based on work hours and checks for assignment conflicts
 * Marks slots as available/unavailable based on existing assignments
 *
 * @param {Date} date - The date to generate slots for
 * @param {Object} employee - Employee object with id and workHours
 * @param {string} employee.id - Employee ID
 * @param {Object} employee.workHours - Work hours configuration
 * @param {string} employee.workHours.start - Start time (HH:MM format)
 * @param {string} employee.workHours.end - End time (HH:MM format)
 * @param {Object} settings - Calendar settings
 * @param {string} settings.workStartTime - Global work start time
 * @param {string} settings.workEndTime - Global work end time
 * @param {number} settings.slotDuration - Slot duration in minutes
 * @param {WorkAssignment[]} assignments - Array of all work assignments
 * @returns {TimeSlot[]} Array of time slots for the day
 *
 * @example
 * const slots = generateTimeSlotsForDay(
 *   new Date('2024-01-15'),
 *   { id: 'emp-123', workHours: { start: '08:00', end: '16:30' } },
 *   { workStartTime: '08:00', workEndTime: '16:30', slotDuration: 60 },
 *   assignments
 * );
 */
function generateTimeSlotsForDay(
  date: Date,
  employee: { id: string; workHours: { start: string; end: string } },
  settings: { workStartTime: string; workEndTime: string; slotDuration: number },
  assignments: WorkAssignment[],
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const workStart = settings.workStartTime;
  const workEnd = settings.workEndTime;
  const slotDuration = settings.slotDuration;

  // Parse work hours
  const [startHour, startMinute] = workStart.split(":").map(Number);
  const [endHour, endMinute] = workEnd.split(":").map(Number);

  const workStartTime = new Date(date);
  workStartTime.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

  const workEndTime = new Date(date);
  workEndTime.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

  // Get assignments for this employee on this day
  const dayAssignments = assignments.filter((assignment) => {
    const assignmentDate = new Date(assignment.startTime);
    return assignment.employeeId === employee.id && assignmentDate.toDateString() === date.toDateString() && assignment.status === "scheduled";
  });

  // Generate hourly slots
  const currentTime = new Date(workStartTime);
  while (currentTime < workEndTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

    // Check if this slot conflicts with any assignment
    const hasConflict = dayAssignments.some((assignment) => {
      const assignmentStart = new Date(assignment.startTime);
      const assignmentEnd = new Date(assignment.endTime);

      return (
        (currentTime >= assignmentStart && currentTime < assignmentEnd) ||
        (slotEnd > assignmentStart && slotEnd <= assignmentEnd) ||
        (currentTime <= assignmentStart && slotEnd >= assignmentEnd)
      );
    });

    slots.push({
      start: currentTime.toISOString(),
      end: slotEnd.toISOString(),
      available: !hasConflict,
      employeeId: employee.id,
      assignmentId: hasConflict
        ? dayAssignments.find((a) => {
            const assignmentStart = new Date(a.startTime);
            const assignmentEnd = new Date(a.endTime);
            return currentTime >= assignmentStart && currentTime < assignmentEnd;
          })?.id
        : undefined,
    });

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
  }

  return slots;
}
