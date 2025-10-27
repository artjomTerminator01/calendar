/**
 * Integration tests for Notification Routes
 */

// Mock EmailService BEFORE any imports
const mockEmailService = {
  sendEmail: jest.fn(),
  sendTestEmail: jest.fn(),
};

jest.mock("@/services/emailService", () => ({
  emailService: mockEmailService,
}));

import request from "supertest";
import express, { Express } from "express";
import { notificationRoutes } from "../notificationRoutes";
import { errorHandler } from "@/utils/errorHandler";

describe("Notification Routes - Integration Tests", () => {
  let app: Express;

  beforeAll(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/notifications", notificationRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/notifications/send", () => {
    const validNotificationData = {
      type: "assignment_created",
      recipient: "employee@example.com",
      subject: "New Assignment",
      message: "<p>You have a new assignment</p>",
    };

    it("should return 200 and send notification successfully", async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const response = await request(app).post("/api/notifications/send").send(validNotificationData).expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Notification sent successfully",
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: "employee@example.com",
        subject: "New Assignment",
        html: "<p>You have a new assignment</p>",
        assignmentData: undefined,
      });
    });

    it("should include assignment data when provided", async () => {
      const assignmentData = {
        clientName: "John Doe",
        workType: "measurement",
        startTime: "2024-01-15T08:00:00.000Z",
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/notifications/send")
        .send({
          ...validNotificationData,
          assignmentData,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          assignmentData,
        }),
      );
    });

    it("should return 400 when required fields are missing", async () => {
      const invalidData = {
        type: "assignment_created",
        // Missing recipient, subject, message
      };

      const response = await request(app).post("/api/notifications/send").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should return 400 for invalid notification type", async () => {
      const invalidData = {
        ...validNotificationData,
        type: "invalid_type",
      };

      const response = await request(app).post("/api/notifications/send").send(invalidData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid notification type");
    });

    it("should handle all valid notification types", async () => {
      const validTypes = ["assignment_created", "assignment_updated", "assignment_cancelled", "client_booking"];

      for (const type of validTypes) {
        jest.clearAllMocks();
        mockEmailService.sendEmail.mockResolvedValue(true);

        const response = await request(app)
          .post("/api/notifications/send")
          .send({
            ...validNotificationData,
            type,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it("should return 500 when email sending fails", async () => {
      mockEmailService.sendEmail.mockResolvedValue(false);

      const response = await request(app).post("/api/notifications/send").send(validNotificationData).expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to send email");
    });

    it("should handle email service errors", async () => {
      mockEmailService.sendEmail.mockRejectedValue(new Error("Email service error"));

      const response = await request(app).post("/api/notifications/send").send(validNotificationData).expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to send notification");
    });
  });

  describe("POST /api/notifications/test", () => {
    it("should return 200 and send test email successfully", async () => {
      mockEmailService.sendTestEmail.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/notifications/test")
        .send({
          recipient: "test@example.com",
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Test email sent successfully",
      });
      expect(mockEmailService.sendTestEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("should return 400 when recipient is missing", async () => {
      const response = await request(app).post("/api/notifications/test").send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Recipient email is required");
    });

    it("should return 500 when test email sending fails", async () => {
      mockEmailService.sendTestEmail.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/notifications/test")
        .send({
          recipient: "test@example.com",
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to send test email");
    });

    it("should handle email service errors", async () => {
      mockEmailService.sendTestEmail.mockRejectedValue(new Error("Service error"));

      const response = await request(app)
        .post("/api/notifications/test")
        .send({
          recipient: "test@example.com",
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to send test email");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/notifications/send")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle empty request body", async () => {
      const response = await request(app).post("/api/notifications/send").send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("should handle very long email content", async () => {
      const longMessage = "<p>" + "a".repeat(10000) + "</p>";
      mockEmailService.sendEmail.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/notifications/send")
        .send({
          type: "assignment_created",
          recipient: "test@example.com",
          subject: "Test",
          message: longMessage,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should handle special characters in email content", async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/notifications/send")
        .send({
          type: "assignment_created",
          recipient: "test@example.com",
          subject: "Tööülesanne õnnestus!",
          message: "<p>Töö tehtud ära! 🎉</p>",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
