import { CheckCircle, X } from "lucide-react";

import { merge } from "@/utils/ui";

/**
 * Props interface for SuccessAlert component
 * @interface SuccessAlertProps
 * @property {string} [title] - Alert title (defaults to "Edukas")
 * @property {string} message - Alert message content
 * @property {Function} [onClose] - Optional close handler function
 * @property {string} [className] - Additional CSS classes
 */
interface SuccessAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Success alert component for displaying success messages
 * Shows success icon, title, and message with optional close button
 * Uses green color scheme for success styling
 * Supports dismissible functionality with close handler
 *
 * @component
 * @param {SuccessAlertProps} props - Component props
 * @returns {JSX.Element} Success alert with icon and message
 *
 * @example
 * <SuccessAlert
 *   title="Operation Successful"
 *   message="Data has been saved successfully"
 *   onClose={() => setShowSuccess(false)}
 * />
 *
 * @example
 * <SuccessAlert message="Changes saved" />
 */
export const SuccessAlert = ({ title = "Edukas", message, onClose, className }: SuccessAlertProps) => {
  return (
    <div className={merge("bg-green-50 border border-green-200 rounded-lg p-4 mb-4", className)}>
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 mb-1">{title}</h3>
          <p className="text-sm text-green-700">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-3 text-green-400 hover:text-green-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
