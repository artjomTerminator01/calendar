import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { merge } from "@/utils/ui";

/**
 * Props interface for StatCard component
 * @interface StatCardProps
 * @property {string} title - The card title
 * @property {string | number} value - The main value to display
 * @property {boolean} [loading] - Whether to show loading skeleton
 * @property {"primary" | "success" | "warning" | "danger" | "info"} [color] - Color theme for the value
 * @property {ReactNode} [icon] - Optional icon to display
 * @property {Function} [onClick] - Optional click handler
 * @property {string} [href] - Optional navigation path (uses React Router)
 * @property {string} [className] - Additional CSS classes
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * Reusable stat card component for displaying metrics with optional navigation
 * Shows title, value, and optional icon with color-coded styling
 * Supports click handlers and React Router navigation
 * Includes loading skeleton animation and hover effects
 * Uses responsive design with proper accessibility
 *
 * @component
 * @param {StatCardProps} props - Component props
 * @returns {JSX.Element} Stat card with metric display and optional navigation
 *
 * @example
 * <StatCard
 *   title="Total Users"
 *   value={userCount}
 *   color="primary"
 *   icon={<Users className="w-6 h-6" />}
 *   href="/admin/users"
 * />
 *
 * @example
 * <StatCard
 *   title="Revenue"
 *   value="$12,345"
 *   color="success"
 *   loading={isLoading}
 *   onClick={() => navigate('/reports')}
 * />
 */
export const StatCard = ({ title, value, loading = false, color = "primary", icon, onClick, href, className }: StatCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const isClickable = onClick || href;

  const colorClasses = {
    primary: "text-primary-600",
    success: "text-success-600",
    warning: "text-warning-600",
    danger: "text-danger-600",
    info: "text-info-600",
  };

  const hoverClasses = isClickable ? "hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer" : "";

  return (
    <div className={merge("card p-6", hoverClasses, className)} onClick={isClickable ? handleClick : undefined}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      ) : (
        <p className={merge("text-3xl font-bold", colorClasses[color])}>{value}</p>
      )}
    </div>
  );
};
