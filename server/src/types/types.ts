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
  workType: "measurement" | "maintenance" | "demolition" | "consultation";
  startTime: string;
  endTime: string;
  comment?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  assignmentId?: string;
  employeeId?: string;
}

export interface CalendarSettings {
  workStartTime: string;
  workEndTime: string;
  slotDuration: number;
  adminEmail: string;
}

export interface StorageData {
  employees: Employee[];
  workAssignments: WorkAssignment[];
  settings: CalendarSettings;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateWorkAssignmentRequest {
  employeeId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  workType: "measurement" | "maintenance" | "demolition" | "consultation";
  startTime: string;
  endTime: string;
  comment?: string;
}

export interface UpdateWorkAssignmentRequest extends Partial<CreateWorkAssignmentRequest> {
  id: string;
  status?: "scheduled" | "completed" | "cancelled";
}

export interface GetTimeSlotsRequest {
  employeeId?: string;
  startDate: string;
  endDate: string;
}
