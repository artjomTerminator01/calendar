import { WorkAssignment } from "@/types";

/**
 * Constructs email content for employee notifications
 * Creates Estonian-language email subject and message for work assignment notifications
 * Supports both creation and update scenarios
 *
 * @param {Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">} data - Work assignment data without metadata
 * @param {boolean} isUpdate - Whether this is an update notification (true) or creation notification (false)
 * @returns {{ subject: string; message: string }} Object containing email subject and message
 *
 * @example
 * const emailContent = constructEmployeeEmail({
 *   employeeId: "emp-123",
 *   clientName: "John Doe",
 *   clientPhone: "1234567890",
 *   clientAddress: "123 Main St",
 *   workType: "measurement",
 *   startTime: "2024-01-15T09:00:00Z",
 *   endTime: "2024-01-15T10:00:00Z",
 *   status: "scheduled"
 * }, false);
 * // Returns: { subject: "Töö planeeritud - John Doe", message: "Klient: John Doe..." }
 */
export const constructEmployeeEmail = (data: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">, isUpdate: boolean) => {
  const subject = isUpdate ? `Töö muudetud - ${data.clientName}` : `Töö planeeritud - ${data.clientName}`;

  const message = `
    Klient: ${data.clientName}
    Telefon: ${data.clientPhone}
    Aadress: ${data.clientAddress}
    Aeg: ${new Date(data.startTime).toLocaleString("et-EE")}
    ${data.comment ? `Kommentaar: ${data.comment}` : ""}
  `;

  return { subject, message };
};
