import { ReactNode } from "react";
import { format } from "date-fns";
import { User, Phone, MapPin, Calendar } from "lucide-react";

import { WorkAssignment } from "@/types";
import { getStatusLabel, getWorkTypeLabel } from "@/utils/helpers";
import { getStatusColor, merge } from "@/utils/ui";

/**
 * Props interface for AssignmentCard component
 * @interface AssignmentCardProps
 * @property {WorkAssignment} assignment - Assignment data to display
 * @property {string} [employeeName] - Name of the assigned employee
 * @property {ReactNode} [actions] - Optional action buttons (edit, delete, etc.)
 * @property {string} [className] - Additional CSS classes
 */
export interface AssignmentCardProps {
  assignment: WorkAssignment;
  employeeName?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Reusable assignment card component for displaying work assignment information
 * Shows client details, employee assignment, work type, status, and time information
 * Displays status badge with color coding and optional action buttons
 * Supports responsive grid layout for different screen sizes
 *
 * @component
 * @param {AssignmentCardProps} props - Component props
 * @returns {JSX.Element} Assignment card with client and work details
 *
 * @example
 * <AssignmentCard
 *   assignment={assignment}
 *   employeeName="John Doe"
 *   actions={<button>Edit</button>}
 *   className="mb-4"
 * />
 */
export const AssignmentCard = ({ assignment, employeeName, actions, className }: AssignmentCardProps) => {
  return (
    <div className={merge("border border-gray-200 rounded-lg p-4", className)}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{assignment.clientName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
              {getStatusLabel(assignment.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{employeeName || "Tundmatu töötaja"}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>{assignment.clientPhone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{assignment.clientAddress}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {format(new Date(assignment.startTime), "dd.MM.yyyy HH:mm")} -{format(new Date(assignment.endTime), "HH:mm")}
              </span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {getWorkTypeLabel(assignment.workType)}
              </span>
            </div>
          </div>

          {assignment.comment && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Kommentaar:</strong> {assignment.comment}
            </div>
          )}
        </div>

        {actions && <div className="flex space-x-2 ml-4">{actions}</div>}
      </div>
    </div>
  );
};
