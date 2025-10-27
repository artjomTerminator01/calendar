import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

import { WorkAssignment, Employee, CalendarEvent, CalendarView } from "@/types";

/**
 * Formats a time string to HH:mm format
 * Converts ISO time string to Estonian 24-hour format
 *
 * @param {string} timeString - ISO time string (e.g., "2024-01-15T09:00:00Z")
 * @returns {string} Formatted time string (e.g., "09:00")
 *
 * @example
 * formatTime("2024-01-15T09:00:00Z") // Returns: "09:00"
 * formatTime("2024-01-15T14:30:00Z") // Returns: "14:30"
 */
export const formatTime = (timeString: string): string => {
  return format(new Date(timeString), "HH:mm");
};

/**
 * Formats a date to DD.MM.YYYY format
 * Converts Date object to Estonian date format
 *
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string (e.g., "15.01.2024")
 *
 * @example
 * formatDate(new Date('2024-01-15')) // Returns: "15.01.2024"
 */
export const formatDate = (date: Date): string => {
  return format(date, "dd.MM.yyyy");
};

/**
 * Gets Estonian label for work type
 * Maps English work type keys to Estonian display labels
 *
 * @param {string} workType - Work type key (measurement, maintenance, demolition, consultation)
 * @returns {string} Estonian label for the work type
 *
 * @example
 * getWorkTypeLabel("measurement") // Returns: "Mõõdistus"
 * getWorkTypeLabel("maintenance") // Returns: "Hooldus"
 */
export const getWorkTypeLabel = (workType: string): string => {
  const labels: Record<string, string> = {
    measurement: "Mõõdistus",
    maintenance: "Hooldus",
    demolition: "Lammutus",
    consultation: "Konsultatsioon",
  };
  return labels[workType] || workType;
};

/**
 * Gets Estonian label for assignment status
 * Maps English status keys to Estonian display labels
 *
 * @param {string} status - Status key (scheduled, completed, cancelled)
 * @returns {string} Estonian label for the status
 *
 * @example
 * getStatusLabel("scheduled") // Returns: "Planeeritud"
 * getStatusLabel("completed") // Returns: "Lõpetatud"
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    scheduled: "Planeeritud",
    completed: "Lõpetatud",
    cancelled: "Tühistatud",
  };
  return labels[status] || status;
};

/**
 * Generates a unique random ID string
 * Creates a 9-character alphanumeric string for temporary IDs
 *
 * @returns {string} Random unique ID string
 *
 * @example
 * generateId() // Returns: "a1b2c3d4e"
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Converts work assignments to calendar events
 * Transforms assignment data into format suitable for calendar display
 * Includes employee names and work type labels
 *
 * @param {WorkAssignment[] | null} assignments - Array of work assignments
 * @param {Employee[] | null} employees - Array of employees for name lookup
 * @returns {CalendarEvent[]} Array of calendar events
 *
 * @example
 * const events = convertAssignmentsToEvents(assignments, employees);
 * // Returns: [{ id: "1", title: "John Doe - Mõõdistus (Jane Smith)", start: Date, end: Date, ... }]
 */
export const convertAssignmentsToEvents = (assignments: WorkAssignment[] | null, employees: Employee[] | null): CalendarEvent[] => {
  return (
    assignments?.map((assignment) => ({
      id: assignment.id,
      title: `${assignment.clientName} - ${getWorkTypeLabel(assignment.workType)} (${
        employees?.find((emp) => emp.id === assignment.employeeId)?.name || "Tundmatu"
      })`,
      start: new Date(assignment.startTime),
      end: new Date(assignment.endTime),
      resource: {
        employeeId: assignment.employeeId,
        employeeName: employees?.find((emp) => emp.id === assignment.employeeId)?.name || "Tundmatu",
      },
      type: "assignment",
      status: assignment.status,
    })) || []
  );
};

/**
 * Calculates date range based on calendar view type
 * Returns start and end dates for different calendar views (month, week, day)
 * Uses Sunday as week start for consistency
 *
 * @param {Date} date - Reference date for the range calculation
 * @param {CalendarView} view - Calendar view type (MONTH, WEEK, DAY)
 * @returns {{ startDate: Date; endDate: Date }} Object containing start and end dates
 *
 * @example
 * const range = getDateRangeForView(new Date('2024-01-15'), CalendarView.WEEK);
 * // Returns: { startDate: Date(2024-01-14), endDate: Date(2024-01-20) }
 */
export const getDateRangeForView = (date: Date, view: CalendarView): { startDate: Date; endDate: Date } => {
  switch (view) {
    case CalendarView.MONTH:
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
    case CalendarView.WEEK:
      return {
        startDate: startOfWeek(date, { weekStartsOn: 0 }),
        endDate: endOfWeek(date, { weekStartsOn: 0 }),
      };
    case CalendarView.DAY:
      return {
        startDate: startOfDay(date),
        endDate: endOfDay(date),
      };
    default:
      return {
        startDate: startOfWeek(date, { weekStartsOn: 0 }),
        endDate: endOfWeek(date, { weekStartsOn: 0 }),
      };
  }
};
