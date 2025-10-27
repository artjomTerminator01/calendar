import axios from "axios";

import { ApiResponse, Employee, WorkAssignment, TimeSlot } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Employee API
export const employeeApi = {
  getAll: (): Promise<ApiResponse<Employee[]>> => api.get("/employees").then((res) => res.data),
  getById: (id: string): Promise<ApiResponse<Employee>> => api.get(`/employees/${id}`).then((res) => res.data),
  create: (employee: Omit<Employee, "id">): Promise<ApiResponse<Employee>> => api.post("/employees", employee).then((res) => res.data),
  update: (id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => api.put(`/employees/${id}`, updates).then((res) => res.data),
  delete: (id: string): Promise<ApiResponse<void>> => api.delete(`/employees/${id}`).then((res) => res.data),
};

// Work Assignment API
export const assignmentApi = {
  getAll: (): Promise<ApiResponse<WorkAssignment[]>> => api.get("/assignments").then((res) => res.data),
  getById: (id: string): Promise<ApiResponse<WorkAssignment>> => api.get(`/assignments/${id}`).then((res) => res.data),
  create: (assignment: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<WorkAssignment>> =>
    api.post("/assignments", assignment).then((res) => res.data),
  update: (id: string, updates: Partial<WorkAssignment>): Promise<ApiResponse<WorkAssignment>> =>
    api.put(`/assignments/${id}`, updates).then((res) => res.data),
  delete: (id: string): Promise<ApiResponse<void>> => api.delete(`/assignments/${id}`).then((res) => res.data),
};

// Calendar API
export const calendarApi = {
  getTimeSlots: (params: { employeeId?: string; startDate: string; endDate: string }): Promise<ApiResponse<TimeSlot[]>> =>
    api.get("/calendar/timeslots", { params }).then((res) => res.data),
  getAssignments: (params: { startDate: string; endDate: string; employeeId?: string }): Promise<ApiResponse<WorkAssignment[]>> =>
    api.get("/calendar/assignments", { params }).then((res) => res.data),
  getEmployeeSchedule: (
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ employee: Employee; assignments: WorkAssignment[] }>> =>
    api
      .get(`/calendar/employee/${employeeId}/schedule`, {
        params: { startDate, endDate },
      })
      .then((res) => res.data),
};

// Notification API
export const notificationApi = {
  sendNotification: (data: { type: string; recipient: string; subject: string; message: string; assignmentData?: any }): Promise<ApiResponse<void>> =>
    api.post("/notifications/send", data).then((res) => res.data),
};

export default api;
