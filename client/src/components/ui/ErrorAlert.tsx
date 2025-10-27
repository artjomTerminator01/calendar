import { AlertCircle, X } from "lucide-react";

import { merge } from "@/utils/ui";

/**
 * Props interface for ErrorAlert component
 * @interface ErrorAlertProps
 * @property {string} [title] - Alert title (defaults to "Viga")
 * @property {string} message - Alert message content
 * @property {Function} [onClose] - Optional close handler function
 * @property {string} [className] - Additional CSS classes
 */
interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Error alert component for displaying error messages
 * Shows error icon, title, and message with optional close button
 * Uses red color scheme for error styling
 * Supports dismissible functionality with close handler
 *
 * @component
 * @param {ErrorAlertProps} props - Component props
 * @returns {JSX.Element} Error alert with icon and message
 *
 * @example
 * <ErrorAlert
 *   title="Validation Error"
 *   message="Please fill in all required fields"
 *   onClose={() => setShowError(false)}
 * />
 *
 * @example
 * <ErrorAlert message="Something went wrong" />
 */
export const ErrorAlert = ({ title = "Viga", message, onClose, className }: ErrorAlertProps) => {
  return (
    <div className={merge("bg-red-50 border border-red-200 rounded-lg p-4 mb-4", className)}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-3 text-red-400 hover:text-red-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
