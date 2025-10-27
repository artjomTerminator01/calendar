import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ClientLayout } from "@/components/client/ClientLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { EmployeeManagement } from "@/pages/admin/EmployeeManagement";
import { AssignmentManagement } from "@/pages/admin/AssignmentManagement";
import { CalendarView } from "@/pages/admin/CalendarView";
import { ClientBooking } from "@/pages/client/ClientBooking";
import { SuccessPage } from "@/pages/common/SuccessPage";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="assignments" element={<AssignmentManagement />} />
            <Route path="calendar" element={<CalendarView />} />
          </Route>

          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<ClientBooking />} />
          </Route>

          {/* Common Routes */}
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
