import { ButtonHTMLAttributes, forwardRef } from "react";

import { merge } from "@/utils/ui";

/**
 * Props interface for Button component extending HTML button attributes
 * @interface ButtonProps
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 * @property {"primary" | "secondary"} [variant] - Button style variant
 * @property {"sm" | "md" | "lg"} [size] - Button size variant
 * @property {boolean} [loading] - Whether to show loading spinner
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

/**
 * Reusable button component with multiple variants and sizes
 * Supports loading state with spinner animation
 * Uses forwardRef for proper ref handling
 * Includes proper focus states and disabled styling
 *
 * @component
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Styled button with optional loading state
 *
 * @example
 * <Button variant="primary" size="lg" loading={false}>
 *   Click Me
 * </Button>

 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        className={merge(baseStyles, variants[variant], sizes[size], loading && "cursor-not-allowed", className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
