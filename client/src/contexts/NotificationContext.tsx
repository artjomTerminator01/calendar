import { createContext, useContext, useState, ReactNode, useEffect } from "react";

import { ErrorAlert, SuccessAlert } from "@/components/ui";

/**
 * Type definition for notification types
 * @typedef {"success" | "error"} NotificationType
 */
type NotificationType = "success" | "error";

/**
 * Interface for notification data structure
 * @interface Notification
 * @property {NotificationType} type - Type of notification (success or error)
 * @property {string} message - Main notification message content
 * @property {string} [title] - Optional notification title
 */
interface Notification {
  type: NotificationType;
  message: string;
  title?: string;
}

/**
 * Interface for notification context value
 * @interface NotificationContextType
 * @property {Function} showSuccess - Function to show success notification
 * @property {Function} showError - Function to show error notification
 * @property {Function} hideNotification - Function to hide current notification
 */
interface NotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  hideNotification: () => void;
}

/**
 * React context for global notification management
 * Provides centralized notification state and methods
 * @constant
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Props interface for NotificationProvider component
 * @interface NotificationProviderProps
 * @property {ReactNode} children - Child components to wrap
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Notification provider component for global notification management
 * Provides notification context to child components
 * Displays notifications as fixed positioned alerts
 * Auto-dismisses notifications after 3 seconds
 * Supports both success and error notification types
 *
 * @component
 * @param {NotificationProviderProps} props - Component props
 * @returns {JSX.Element} Provider component with notification display
 *
 * @example
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 */
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showSuccess = (message: string, title = "Edukas") => {
    setNotification({ type: "success", message, title });
  };

  const showError = (message: string, title = "Viga") => {
    setNotification({ type: "error", message, title });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const NotificationDisplay = notification ? (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {notification.type === "error" ? (
        <ErrorAlert title={notification.title} message={notification.message} onClose={hideNotification} />
      ) : (
        <SuccessAlert title={notification.title} message={notification.message} onClose={hideNotification} />
      )}
    </div>
  ) : null;

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, hideNotification }}>
      {children}
      {NotificationDisplay}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to access notification context
 * Provides methods to show success/error notifications and hide current notification
 * Throws error if used outside of NotificationProvider
 *
 * @returns {NotificationContextType} Notification context with show/hide methods
 * @throws {Error} If used outside of NotificationProvider
 *
 * @example
 * const { showSuccess, showError, hideNotification } = useNotification();
 *
 * @example
 * // Show success notification
 * showSuccess("Data saved successfully");
 *
 * @example
 * // Show error notification with custom title
 * showError("Failed to save data", "Save Error");
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

/**
 * Backwards compatibility hook for error notifications only
 * Provides only the showError method from notification context
 * Maintains compatibility with existing code that used useError
 *
 * @returns {{ showError: Function }} Object containing showError method
 *
 * @example
 * const { showError } = useError();
 * showError("Something went wrong");
 */
export const useError = () => {
  const { showError } = useNotification();
  return { showError };
};
