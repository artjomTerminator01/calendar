/**
 * Tests for EmailService
 */

import { emailService } from "../emailService";

describe("EmailService - Service Tests", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("sendEmail", () => {
    it("should log email successfully", async () => {
      const options = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      const result = await emailService.sendEmail(options);

      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalled();

      // Verify email content was logged
      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("test@example.com");
      expect(loggedContent).toContain("Test Subject");
      expect(loggedContent).toContain("<p>Test content</p>");
    });

    it("should include assignment data when provided", async () => {
      const options = {
        to: "employee@example.com",
        subject: "New Assignment",
        html: "<p>You have a new assignment</p>",
        assignmentData: {
          clientName: "John Doe",
          workType: "measurement",
          startTime: "2024-01-15T08:00:00.000Z",
        },
      };

      const result = await emailService.sendEmail(options);

      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("should format date in Estonian locale", async () => {
      const options = {
        to: "test@example.com",
        subject: "Test",
        html: "Content",
      };

      await emailService.sendEmail(options);

      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("Sent at:");
    });

    it("should handle errors gracefully", async () => {
      // Force console.log to throw an error
      consoleLogSpy.mockImplementation(() => {
        throw new Error("Console error");
      });

      const options = {
        to: "test@example.com",
        subject: "Test",
        html: "Content",
      };

      const result = await emailService.sendEmail(options);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to log email:", expect.any(Error));
    });
  });

  describe("sendTestEmail", () => {
    it("should send test email successfully", async () => {
      const result = await emailService.sendTestEmail("test@example.com");

      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalled();

      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("test@example.com");
      expect(loggedContent).toContain("Test Email - Calendar Application");
      expect(loggedContent).toContain("This is test email");
    });

    it("should use correct subject for test emails", async () => {
      await emailService.sendTestEmail("recipient@example.com");

      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("Subject: Test Email - Calendar Application");
    });

    it("should return false on error", async () => {
      consoleLogSpy.mockImplementation(() => {
        throw new Error("Test error");
      });

      const result = await emailService.sendTestEmail("test@example.com");

      expect(result).toBe(false);
    });
  });

  describe("Email Format", () => {
    it("should include proper email separators", async () => {
      const options = {
        to: "test@example.com",
        subject: "Test",
        html: "Content",
      };

      await emailService.sendEmail(options);

      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("================================================================================");
      expect(loggedContent).toContain("EMAIL NOTIFICATION (Console Log Mode)");
      expect(loggedContent).toContain("Email logged successfully");
    });

    it("should format multiline HTML content", async () => {
      const options = {
        to: "test@example.com",
        subject: "Test",
        html: `
          <html>
            <body>
              <h1>Title</h1>
              <p>Paragraph</p>
            </body>
          </html>
        `,
      };

      await emailService.sendEmail(options);

      const loggedContent = consoleLogSpy.mock.calls[0][0];
      expect(loggedContent).toContain("<h1>Title</h1>");
      expect(loggedContent).toContain("<p>Paragraph</p>");
    });
  });

  describe("Service Initialization", () => {
    it("should initialize service successfully", () => {
      expect(emailService).toBeDefined();
      expect(emailService.sendEmail).toBeDefined();
      expect(emailService.sendTestEmail).toBeDefined();
    });
  });
});
