import { ReactNode } from "react";
import { User, Mail, Clock } from "lucide-react";

import { Employee } from "@/types";
import { merge } from "@/utils/ui";

/**
 * Props interface for EmployeeCard component
 * @interface EmployeeCardProps
 * @property {Employee} employee - Employee data to display
 * @property {ReactNode} [actions] - Optional action buttons (edit, delete, etc.)
 * @property {"default" | "compact" | "detailed"} [variant] - Display variant
 * @property {string} [className] - Additional CSS classes
 * @property {Function} [onClick] - Optional click handler for the entire card
 */
export interface EmployeeCardProps {
  employee: Employee;
  actions?: ReactNode;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable employee card component for displaying employee information
 * Shows employee name, email, and work hours with optional action buttons
 * Supports multiple display variants (default, compact, detailed)
 * Includes clickable functionality and hover effects when onClick is provided
 * Uses responsive layout and consistent styling
 *
 * @component
 * @param {EmployeeCardProps} props - Component props
 * @returns {JSX.Element} Employee card with contact and work information
 *
 * @example
 * <EmployeeCard
 *   employee={employee}
 *   actions={<button>Edit</button>}
 *   variant="default"
 *   onClick={() => navigate(`/admin/employees/${employee.id}`)}
 * />
 */
export const EmployeeCard = ({ employee, actions, variant = "default", className, onClick }: EmployeeCardProps) => {
  const isClickable = !!onClick;

  const baseClasses = "border border-gray-200 rounded-lg p-4 transition-colors";
  const clickableClasses = isClickable ? "hover:shadow-md hover:border-gray-300 cursor-pointer" : "";

  const compactClasses = variant === "compact" ? "p-3" : "";
  const detailedClasses = variant === "detailed" ? "p-6" : "";

  return (
    <div className={merge(baseClasses, clickableClasses, compactClasses, detailedClasses, className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="font-semibold text-lg text-gray-900">{employee.name}</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">{employee.email}</span>
            </div>

            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Tööaeg: {employee.workHours.start} - {employee.workHours.end}
              </span>
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center space-x-2 ml-4">{actions}</div>}
      </div>
    </div>
  );
};
