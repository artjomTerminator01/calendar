/**
 * Email options for sending notifications
 * @interface EmailOptions
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject line
 * @property {string} html - HTML content of the email
 * @property {Record<string, unknown>} [assignmentData] - Optional assignment data for context
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  assignmentData?: Record<string, unknown>;
}

/**
 * Service class for handling email notifications
 * Currently operates in console logging mode (no actual emails sent)
 * Logs all email content to console for development/testing
 *
 * @class EmailService
 * @example
 * await emailService.sendEmail({
 *   to: "user@example.com",
 *   subject: "New Assignment",
 *   html: "<p>Assignment details...</p>"
 * });
 */
class EmailService {
  constructor() {
    console.log("📧 Email service initialized in console logging mode");
  }

  /**
   * Sends an email notification (logs to console in current implementation)
   * Formats email content with Estonian locale timestamp
   *
   * @param {EmailOptions} options - Email configuration object
   * @returns {Promise<boolean>} True if email logged successfully, false on error
   * @example
   * const success = await emailService.sendEmail({
   *   to: "employee@example.com",
   *   subject: "Work Assignment Notification",
   *   html: "<h1>New Assignment</h1><p>Details here...</p>",
   *   assignmentData: { id: "123", clientName: "John Doe" }
   * });
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailLog = `
          ================================================================================
          EMAIL NOTIFICATION (Console Log Mode)
          ================================================================================
          To: ${options.to}
          Subject: ${options.subject}
          Sent at: ${new Date().toLocaleString("et-EE")}
          --------------------------------------------------------------------------------
          Email Content:
          --------------------------------------------------------------------------------
          ${options.html}
          ================================================================================
          Email logged successfully (not actually sent)
          ================================================================================
        `;

      console.log(emailLog);
      return true;
    } catch (error) {
      console.error("Failed to log email:", error);
      return false;
    }
  }

  /**
   * Sends a test email to verify email service functionality
   * Uses predefined test content
   *
   * @param {string} recipient - Email address to send test email to
   * @returns {Promise<boolean>} True if test email logged successfully, false on error
   * @example
   * const success = await emailService.sendTestEmail("admin@example.com");
   * if (success) console.log("Test email sent successfully");
   */
  public async sendTestEmail(recipient: string): Promise<boolean> {
    const testHtml = `
      This is test email.
    `;

    return this.sendEmail({
      to: recipient,
      subject: "Test Email - Calendar Application",
      html: testHtml,
    });
  }
}

/**
 * Singleton instance of EmailService
 * Use this exported instance for all email operations
 * @constant
 * @example
 * import { emailService } from "@/services/emailService";
 * await emailService.sendEmail({ ... });
 */
export const emailService = new EmailService();
