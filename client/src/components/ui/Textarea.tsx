import { TextareaHTMLAttributes, forwardRef } from "react";

import { merge } from "@/utils/ui";

/**
 * Props interface for Textarea component extending HTML textarea attributes
 * @interface TextareaProps
 * @extends TextareaHTMLAttributes<HTMLTextAreaElement>
 * @property {boolean} [error] - Whether to show error styling
 * @property {string} [helperText] - Helper text below the textarea
 * @property {string} [label] - Label text for the textarea
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

/**
 * Reusable textarea component with label, error states, and helper text
 * Supports all standard HTML textarea attributes
 * Uses forwardRef for proper ref handling
 * Includes proper focus states and validation styling
 * Automatically generates unique IDs for accessibility
 * Supports vertical resizing only
 *
 * @component
 * @param {TextareaProps} props - Component props
 * @returns {JSX.Element} Styled textarea with label and helper text
 *
 * @example
 * <Textarea
 *   label="Description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   rows={4}
 *   placeholder="Enter description..."
 * />
 *
 * @example
 * <Textarea
 *   label="Comments"
 *   error={hasError}
 *   helperText="Please provide detailed comments"
 *   rows={3}
 * />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error = false, helperText, label, id, ...props }, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={merge(
          "w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical",
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

Textarea.displayName = "Textarea";

export { Textarea };
