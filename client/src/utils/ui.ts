import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges CSS class names using clsx and tailwind-merge
 * Combines conditional classes and resolves Tailwind CSS conflicts
 * Useful for creating dynamic class strings in React components
 *
 * @param {...ClassValue[]} inputs - CSS class names or conditional class objects
 * @returns {string} Merged CSS class string
 *
 * @example
 * merge("px-4 py-2", "bg-blue-500", { "text-white": isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
 */
export const merge = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Returns Tailwind CSS classes for assignment status badges
 * Provides consistent styling for different assignment statuses
 * Uses custom color scheme (warning, success, danger)
 *
 * @param {string} status - Assignment status (scheduled, completed, cancelled)
 * @returns {string} Tailwind CSS class string for status badge
 *
 * @example
 * getStatusColor("scheduled") // Returns: "bg-warning-100 text-warning-800"
 * getStatusColor("completed") // Returns: "bg-success-100 text-success-800"
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: "bg-warning-100 text-warning-800",
    completed: "bg-success-100 text-success-800",
    cancelled: "bg-danger-100 text-danger-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};
