import { InputHTMLAttributes, forwardRef } from "react";

import { merge } from "@/utils/ui";

/**
 * Props interface for Input component extending HTML input attributes
 * @interface InputProps
 * @extends InputHTMLAttributes<HTMLInputElement>
 * @property {boolean} [error] - Whether to show error styling
 * @property {string} [helperText] - Helper text below the input
 * @property {string} [label] - Label text for the input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

/**
 * Reusable input component with label, error states, and helper text
 * Supports all standard HTML input attributes
 * Uses forwardRef for proper ref handling
 * Includes proper focus states and validation styling
 * Automatically generates unique IDs for accessibility
 *
 * @component
 * @param {InputProps} props - Component props
 * @returns {JSX.Element} Styled input with label and helper text
 *
 * @example
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   required
 * />
 *
 * @example
 * <Input
 *   label="Password"
 *   type="password"
 *   error={hasError}
 *   helperText="Password must be at least 8 characters"
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", error = false, helperText, label, id, ...props }, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={merge(
          "w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
          error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {helperText && <p className={merge("text-xs", error ? "text-red-600" : "text-gray-500")}>{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
