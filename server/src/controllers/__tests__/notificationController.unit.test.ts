/**
 * Unit tests for Notification Controller
 */

import { Request, Response } from "express";
import { emailService } from "@/services/emailService";

// Mock EmailService BEFORE importing controller
jest.mock("@/services/emailService", () => ({
  emailService: {
    sendEmail: jest.fn(),
    sendTestEmail: jest.fn(),
  },
}));

// Import controller AFTER mocking
import { notificationController } from "../notificationController";

describe("Notification Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("sendNotification", () => {
    const validNotificationData = {
      type: "assignment_created",
      recipient: "employee@example.com",
      subject: "New Assignment",
      message: "<p>You have a new assignment</p>",
    };

    it("should send notification successfully", async () => {
      mockRequest.body = validNotificationData;
      (emailService.sendEmail as jest.Mock).mockResolvedValue(true);

      await notificationController.sendNotification(mockRequest as Request, mockResponse as Response);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: "employee@example.com",
        subject: "New Assignment",
        html: "<p>You have a new assignment</p>",
        assignmentData: undefined,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification sent successfully",
      });
    });

    it("should include assignment data when provided", async () => {
      const assignmentData = {
        clientName: "John Doe",
        workType: "measurement",
        startTime: "2024-01-15T08:00:00.000Z",
      };

      mockRequest.body = {
        ...validNotificationData,
        assignmentData,
      };
      (emailService.sendEmail as jest.Mock).mockResolvedValue(true);

      await notificationController.sendNotification(mockRequest as Request, mockResponse as Response);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: "employee@example.com",
        subject: "New Assignment",
        html: "<p>You have a new assignment</p>",
        assignmentData,
      });
    });

    it("should throw error when required fields are missing", async () => {
      mockRequest.body = {
        type: "assignment_created",
        // Missing recipient, subject, message
      };

      await expect(notificationController.sendNotification(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Missing required fields: type, recipient, subject, message",
      );
    });

    it("should throw error for invalid notification type", async () => {
      mockRequest.body = {
        ...validNotificationData,
        type: "invalid_type",
      };

      await expect(notificationController.sendNotification(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Invalid notification type",
      );
    });

    it("should handle all valid notification types", async () => {
      const validTypes = ["assignment_created", "assignment_updated", "assignment_cancelled", "client_booking"];

      for (const type of validTypes) {
        jest.clearAllMocks();
        mockRequest.body = {
          ...validNotificationData,
          type,
        };
        (emailService.sendEmail as jest.Mock).mockResolvedValue(true);

        await notificationController.sendNotification(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          message: "Notification sent successfully",
        });
      }
    });

    it("should throw error when email sending fails", async () => {
      mockRequest.body = validNotificationData;
      (emailService.sendEmail as jest.Mock).mockResolvedValue(false);

      await expect(notificationController.sendNotification(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Failed to send email");
    });

    it("should handle email service errors", async () => {
      mockRequest.body = validNotificationData;
      (emailService.sendEmail as jest.Mock).mockRejectedValue(new Error("Email service error"));

      await expect(notificationController.sendNotification(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        "Failed to send notification",
      );
    });
  });

  describe("testEmail", () => {
    it("should send test email successfully", async () => {
      mockRequest.body = {
        recipient: "test@example.com",
      };
      (emailService.sendTestEmail as jest.Mock).mockResolvedValue(true);

      await notificationController.testEmail(mockRequest as Request, mockResponse as Response);

      expect(emailService.sendTestEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Test email sent successfully",
      });
    });

    it("should throw error when recipient is missing", async () => {
      mockRequest.body = {};

      await expect(notificationController.testEmail(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Recipient email is required");
    });

    it("should throw error when test email sending fails", async () => {
      mockRequest.body = {
        recipient: "test@example.com",
      };
      (emailService.sendTestEmail as jest.Mock).mockResolvedValue(false);

      await expect(notificationController.testEmail(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Failed to send test email");
    });

    it("should handle email service errors", async () => {
      mockRequest.body = {
        recipient: "test@example.com",
      };
      (emailService.sendTestEmail as jest.Mock).mockRejectedValue(new Error("Service error"));

      await expect(notificationController.testEmail(mockRequest as Request, mockResponse as Response)).rejects.toThrow("Failed to send test email");
    });
  });
});
