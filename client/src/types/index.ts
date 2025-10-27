export enum WorkType {
  MEASUREMENT = "measurement",
  MAINTENANCE = "maintenance",
  DEMOLITION = "demolition",
  CONSULTATION = "consultation",
}

export enum CalendarView {
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
}

export enum AssignmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    employeeId: string;
    employeeName: string;
  };
  type: "assignment" | "available";
  status?: "scheduled" | "completed" | "cancelled";
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  assignmentId?: string;
  employeeId?: string;
}

export interface BookingFormData {
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  workType: WorkType;
  selectedTimeSlot: string;
  comment?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  workHours: {
    start: string;
    end: string;
  };
}

export interface WorkAssignment {
  id: string;
  employeeId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  workType: WorkType;
  startTime: string;
  endTime: string;
  comment?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
