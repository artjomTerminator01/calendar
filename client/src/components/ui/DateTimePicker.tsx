import DatePicker from "react-datepicker";
import { et } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { merge } from "@/utils/ui";

/**
 * Props interface for DateTimePicker component
 * @interface DateTimePickerProps
 * @property {string} [label] - Label text for the input
 * @property {Date | string | null} value - Current value (Date object or HH:mm string)
 * @property {Function} onChange - Change handler function
 * @property {Date} [minTime] - Minimum selectable time
 * @property {Date} [maxTime] - Maximum selectable time
 * @property {boolean} [required] - Whether the field is required
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [timeOnly] - Whether to show only time picker
 * @property {number} [timeIntervals] - Time interval in minutes
 */
interface DateTimePickerProps {
  label?: string;
  value: Date | string | null; // Support both Date and time string (HH:mm)
  onChange: (value: Date | string | null) => void;
  minTime?: Date;
  maxTime?: Date;
  required?: boolean;
  className?: string;
  timeOnly?: boolean; // New prop to show only time picker
  timeIntervals?: number; // Allow customizing time intervals
}

/**
 * Date and time picker component with Estonian locale support
 * Supports both full date-time selection and time-only mode
 * Handles conversion between Date objects and HH:mm strings
 * Uses react-datepicker with Estonian localization
 * Includes proper validation and accessibility features
 *
 * @component
 * @param {DateTimePickerProps} props - Component props
 * @returns {JSX.Element} Date/time picker with label and validation
 *
 * @example
 * <DateTimePicker
 *   label="Select Date and Time"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   required
 * />
 *
 * @example
 * <DateTimePicker
 *   label="Work Start Time"
 *   value="08:00"
 *   onChange={setStartTime}
 *   timeOnly
 *   timeIntervals={30}
 * />
 */
export const DateTimePicker = ({
  label,
  value,
  onChange,
  minTime,
  maxTime,
  required,
  className,
  timeOnly = false,
  timeIntervals = 60,
}: DateTimePickerProps) => {
  // Convert HH:mm string to Date object for time-only mode
  const timeToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object to HH:mm string for time-only mode
  const dateToTime = (date: Date | null): string => {
    if (!date) return "08:00";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Get the selected value for the picker
  const getSelectedValue = (): Date | null => {
    if (!value) return null;
    if (timeOnly && typeof value === "string") {
      return timeToDate(value);
    }
    return value instanceof Date ? value : null;
  };

  // Handle change based on mode
  const handleChange = (date: Date | null) => {
    if (timeOnly) {
      onChange(date ? dateToTime(date) : null);
    } else {
      onChange(date);
    }
  };

  return (
    <div className={merge("flex flex-col", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={getSelectedValue()}
        onChange={handleChange}
        showTimeSelect
        showTimeSelectOnly={timeOnly}
        timeFormat="HH:mm"
        timeIntervals={timeOnly ? 30 : timeIntervals}
        dateFormat={timeOnly ? "HH:mm" : "dd.MM.yyyy HH:mm"}
        locale={et}
        minTime={minTime}
        maxTime={maxTime}
        timeCaption="Aeg"
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
        required={required}
        placeholderText={timeOnly ? "Vali kellaaeg" : "Vali kuupäev ja kellaaeg"}
      />
    </div>
  );
};
