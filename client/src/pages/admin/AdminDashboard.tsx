import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { Users, Calendar, Clock, FileText } from "lucide-react";

import { StatCard } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { employeeApi, assignmentApi } from "@/services/api";

/**
 * Admin dashboard page displaying key statistics and overview
 * Shows employee count, today's assignments, weekly assignments, and total assignments
 * Each stat card is clickable and navigates to relevant management pages
 *
 * @component
 * @returns {JSX.Element} Dashboard page with statistics cards
 *
 * @example
 * <AdminDashboard />
 */
export const AdminDashboard = () => {
  // Fetch employees
  const { data: employees, loading: employeesLoading } = useApi(() => employeeApi.getAll(), []);

  // Fetch assignments
  const { data: assignments, loading: assignmentsLoading } = useApi(() => assignmentApi.getAll(), []);

  // Calculate statistics
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const employeeCount = employees?.length || 0;

  const todayCount =
    assignments?.filter((assignment) => {
      const assignmentDate = new Date(assignment.startTime);
      return assignmentDate >= todayStart && assignmentDate <= todayEnd;
    }).length || 0;

  const weekCount =
    assignments?.filter((assignment) => {
      const assignmentDate = new Date(assignment.startTime);
      return assignmentDate >= weekStart && assignmentDate <= weekEnd;
    }).length || 0;

  const totalAssignments = assignments?.length || 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ülevaade</h1>
        <p className="page-subtitle">Ressursside haldamise kalendri ülevaade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Töötajad"
          value={employeeCount}
          loading={employeesLoading}
          color="primary"
          icon={<Users className="w-6 h-6" />}
          href="/admin/employees"
        />

        <StatCard
          title="Täna planeeritud"
          value={todayCount}
          loading={assignmentsLoading}
          color="success"
          icon={<Calendar className="w-6 h-6" />}
          href="/admin/assignments"
        />

        <StatCard
          title="Selle nädala tööd"
          value={weekCount}
          loading={assignmentsLoading}
          color="warning"
          icon={<Clock className="w-6 h-6" />}
          href="/admin/assignments"
        />

        <StatCard
          title="Kokku tööülesandeid"
          value={totalAssignments}
          loading={assignmentsLoading}
          color="primary"
          icon={<FileText className="w-6 h-6" />}
          href="/admin/assignments"
        />
      </div>
    </div>
  );
};
