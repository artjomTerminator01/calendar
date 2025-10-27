import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/et";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { CalendarEvent, CalendarView as CalendarViewType } from "@/types";
import { Select } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { calendarApi, employeeApi } from "@/services/api";
import { convertAssignmentsToEvents, getDateRangeForView } from "@/utils/helpers";

// Set Estonian locale for moment with 24-hour format
moment.locale("et");
moment.updateLocale("et", {
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD.MM.YYYY",
    LL: "D. MMMM YYYY",
    LLL: "D. MMMM YYYY HH:mm",
    LLLL: "dddd, D. MMMM YYYY HH:mm",
  },
});

const localizer = momentLocalizer(moment);

/**
 * Calendar view page displaying work assignments in a visual calendar format
 * Supports month, week, and day views with employee filtering
 * Uses Estonian locale with 24-hour time format
 * Clicking events navigates to assignment management for editing
 *
 * @component
 * @returns {JSX.Element} Calendar view page with interactive calendar
 *
 * @example
 * <CalendarView />
 */
export const CalendarView = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [currentView, setCurrentView] = useState<CalendarViewType>(CalendarViewType.WEEK);

  const handleViewChange = (view: string) => {
    setCurrentView(view as CalendarViewType);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Navigate to AssignmentManagement with the assignment ID
    navigate(`/admin/assignments?edit=${event.id}`);
  };

  // Fetch employees
  const { data: employees } = useApi(() => employeeApi.getAll(), []);

  // Fetch assignments for the current view
  const { startDate, endDate } = getDateRangeForView(selectedDate, currentView);

  const { data: assignments, loading } = useApi(
    () =>
      calendarApi.getAssignments({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        employeeId: selectedEmployee === "all" ? undefined : selectedEmployee,
      }),
    [selectedDate, selectedEmployee, currentView]
  );

  // Convert assignments to calendar events
  const events: CalendarEvent[] = convertAssignmentsToEvents(assignments, employees);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3b82f6"; // Default blue
    let borderColor = "#2563eb";

    if (event.status === "completed") {
      backgroundColor = "#22c55e"; // Green
      borderColor = "#16a34a";
    } else if (event.status === "cancelled") {
      backgroundColor = "#ef4444"; // Red
      borderColor = "#dc2626";
    } else if (event.status === "scheduled") {
      backgroundColor = "#f59e0b"; // Orange
      borderColor = "#d97706";
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
      },
    };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kalendri Vaade</h1>
        <p className="page-subtitle">Vaata ja planeeri tööaegu</p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              options={[
                { value: "all", label: "Kõik töötajad" },
                ...(employees?.map((employee) => ({
                  value: employee.id,
                  label: employee.name,
                })) || []),
              ]}
              className="w-auto"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="h-96">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={[CalendarViewType.MONTH, CalendarViewType.WEEK, CalendarViewType.DAY]}
              view={currentView}
              onView={handleViewChange}
              date={selectedDate}
              onNavigate={setSelectedDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              min={new Date(1970, 1, 1, 8, 0, 0)}
              max={new Date(1970, 1, 1, 20, 0, 0)}
              step={60}
              timeslots={1}
              messages={{
                next: "Järgmine",
                previous: "Eelmine",
                today: "Täna",
                month: "Kuu",
                week: "Nädal",
                day: "Päev",
                agenda: "Agenda",
                date: "Kuupäev",
                time: "Aeg",
                event: "Sündmus",
                noEventsInRange: "Sellel perioodil pole sündmusi",
                showMore: (total) => `+${total} veel`,
              }}
            />
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-warning-500 rounded mr-2"></div>
            <span className="text-sm">Planeeritud</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-success-500 rounded mr-2"></div>
            <span className="text-sm">Lõpetatud</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-danger-500 rounded mr-2"></div>
            <span className="text-sm">Tühistatud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
