import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

import { merge } from "@/utils/ui";

/**
 * Props interface for Select component extending HTML select attributes
 * @interface SelectProps
 * @extends SelectHTMLAttributes<HTMLSelectElement>
 * @property {boolean} [error] - Whether to show error styling
 * @property {string} [helperText] - Helper text below the select
 * @property {string} [label] - Label text for the select
 * @property {string} [placeholder] - Placeholder option text
 * @property {Array<{value: string; label: string; disabled?: boolean}>} options - Select options
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

/**
 * Reusable select component with label, error states, and helper text
 * Supports all standard HTML select attributes
 * Uses forwardRef for proper ref handling
 * Includes custom dropdown arrow and proper focus states
 * Automatically generates unique IDs for accessibility
 *
 * @component
 * @param {SelectProps} props - Component props
 * @returns {JSX.Element} Styled select with label and helper text
 *
 * @example
 * <Select
 *   label="Choose Option"
 *   value={selectedValue}
 *   onChange={(e) => setSelectedValue(e.target.value)}
 *   options={[
 *     { value: "option1", label: "Option 1" },
 *     { value: "option2", label: "Option 2" }
 *   ]}
 * />
 *
 * @example
 * <Select
 *   label="Status"
 *   placeholder="Select status"
 *   error={hasError}
 *   helperText="Please select a valid status"
 *   options={statusOptions}
 * />
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error = false, helperText, label, placeholder, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={merge(
              "w-full appearance-none bg-white border rounded-lg px-3 py-2 pr-10 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
              error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {helperText && <p className={merge("text-xs", error ? "text-red-600" : "text-gray-500")}>{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
