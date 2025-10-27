import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

/**
 * Admin layout component providing the main structure for admin pages
 * Wraps admin pages with header, sidebar, and main content area
 * Uses React Router Outlet for nested route rendering
 * Provides consistent styling and layout for the administrative interface
 *
 * @component
 * @returns {JSX.Element} Layout wrapper with header, sidebar, and outlet for admin pages
 *
 * @example
 * <AdminLayout />
 *
 * @example
 * // Used in routing:
 * <Route path="/admin" element={<AdminLayout />}>
 *   <Route index element={<AdminDashboard />} />
 *   <Route path="employees" element={<EmployeeManagement />} />
 *   <Route path="assignments" element={<AssignmentManagement />} />
 *   <Route path="calendar" element={<CalendarView />} />
 * </Route>
 */
export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
