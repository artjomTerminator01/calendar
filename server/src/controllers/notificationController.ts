import { Request, Response } from "express";

import { emailService } from "@/services/emailService";
import { createError } from "@/utils/errorHandler";

/**
 * Controller object containing all notification-related API handlers
 * Provides email notification functionality for various business events
 * Handles notification type validation and email service integration
 *
 * @namespace notificationController
 * @example
 * import { notificationController } from "@/controllers/notificationController";
 * router.post("/notifications/send", notificationController.sendNotification);
 */
export const notificationController = {
  /**
   * Sends a notification email for various business events
   * Validates notification type and required fields before sending
   * Supports assignment-related and client booking notifications
   *
   * @param {Request} req - Express request object (expects notification data in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if required fields are missing or notification type is invalid
   * @throws {AppError} 500 if email sending fails
   *
   * @example
   * POST /api/notifications/send
   * Body: {
   *   type: "assignment_created",
   *   recipient: "employee@example.com",
   *   subject: "New Work Assignment",
   *   message: "<h1>New Assignment</h1><p>You have been assigned...</p>",
   *   assignmentData: { id: "123", clientName: "John Doe" }
   * }
   * Response: { success: true, message: "Notification sent successfully" }
   */
  sendNotification: async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, recipient, subject, message, assignmentData } = req.body;

      if (!type || !recipient || !subject || !message) {
        throw createError("Missing required fields: type, recipient, subject, message", 400);
      }

      const validTypes = ["assignment_created", "assignment_updated", "assignment_cancelled", "client_booking"];
      if (!validTypes.includes(type)) throw createError("Invalid notification type", 400);

      const emailSent = await emailService.sendEmail({
        to: recipient,
        subject,
        html: message,
        assignmentData,
      });
      if (!emailSent) throw createError("Failed to send email", 500);

      res.json({
        success: true,
        message: "Notification sent successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to send notification", 500);
    }
  },

  /**
   * Sends a test email to verify email service functionality
   * Uses predefined test content to validate email delivery
   * Useful for testing email configuration and service availability
   *
   * @param {Request} req - Express request object (expects recipient in body)
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   * @throws {AppError} 400 if recipient email is missing
   * @throws {AppError} 500 if test email sending fails
   *
   * @example
   * POST /api/notifications/test
   * Body: { recipient: "admin@example.com" }
   * Response: { success: true, message: "Test email sent successfully" }
   */
  testEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipient } = req.body;
      if (!recipient) throw createError("Recipient email is required", 400);

      const testEmailSent = await emailService.sendTestEmail(recipient);
      if (!testEmailSent) throw createError("Failed to send test email", 500);

      res.json({
        success: true,
        message: "Test email sent successfully",
      });
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }
      throw createError("Failed to send test email", 500);
    }
  },
};
