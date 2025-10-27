import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Calendar } from "lucide-react";

/**
 * Admin sidebar component providing navigation for the administrative interface
 * Displays navigation items with icons and active state highlighting
 * Uses React Router NavLink for client-side routing with exact matching
 * Provides consistent navigation structure for admin pages
 *
 * @component
 * @returns {JSX.Element} Sidebar navigation with admin menu items
 *
 * @example
 * <AdminSidebar />
 *
 * @example
 * // Navigation items include:
 * // - Dashboard (/admin)
 * // - Employees (/admin/employees)
 * // - Assignments (/admin/assignments)
 * // - Calendar (/admin/calendar)
 */
export const AdminSidebar = () => {
  const navItems = [
    { path: "/admin", label: "Ülevaade", icon: LayoutDashboard },
    { path: "/admin/employees", label: "Töötajad", icon: Users },
    { path: "/admin/assignments", label: "Tööülesanded", icon: FileText },
    { path: "/admin/calendar", label: "Kalender", icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
