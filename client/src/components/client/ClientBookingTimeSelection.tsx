import { Dispatch, SetStateAction, useEffect, useCallback, useMemo } from "react";
import { Calendar, Clock } from "lucide-react";

import { BookingFormData, Employee, TimeSlot } from "@/types";
import { Input, Select } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { calendarApi, employeeApi } from "@/services/api";
import { formatTime, formatDate } from "@/utils/helpers";

/**
 * Props interface for ClientBookingTimeSelection component
 * @interface ClientBookingTimeSelectionProps
 * @property {Dispatch<SetStateAction<BookingFormData>>} setFormData - Form data setter function
 * @property {Date} selectedDate - Currently selected date
 * @property {string} selectedEmployee - Currently selected employee ID
 * @property {TimeSlot | null} selectedTimeSlot - Currently selected time slot
 * @property {Function} setSelectedDate - Date setter function
 * @property {Function} setSelectedEmployee - Employee setter function
 * @property {Function} setSelectedTimeSlot - Time slot setter function
 */
interface ClientBookingTimeSelectionProps {
  setFormData: Dispatch<SetStateAction<BookingFormData>>;
  selectedDate: Date;
  selectedEmployee: string;
  selectedTimeSlot: TimeSlot | null;
  setSelectedDate: (date: Date) => void;
  setSelectedEmployee: (employee: string) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void;
}

/**
 * Client time selection component for booking appointments
 * Provides date picker, employee selection, and available time slots
 * Fetches employees and time slots from API with loading states
 * Resets time slot selection when employee changes
 * Uses memoized components for performance optimization
 *
 * @component
 * @param {ClientBookingTimeSelectionProps} props - Component props
 * @returns {JSX.Element} Time selection interface with date, employee, and time slot selection
 *
 * @example
 * <ClientBookingTimeSelection
 *   setFormData={setFormData}
 *   selectedDate={selectedDate}
 *   selectedEmployee={selectedEmployee}
 *   selectedTimeSlot={selectedTimeSlot}
 *   setSelectedDate={setSelectedDate}
 *   setSelectedEmployee={setSelectedEmployee}
 *   setSelectedTimeSlot={setSelectedTimeSlot}
 * />
 */
export const ClientBookingTimeSelection = ({
  setFormData,
  selectedDate,
  selectedEmployee,
  selectedTimeSlot,
  setSelectedDate,
  setSelectedEmployee,
  setSelectedTimeSlot,
}: ClientBookingTimeSelectionProps) => {
  const startDate = selectedDate.toISOString().split("T")[0];

  //Reset selected time slot when user changes employee
  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [selectedEmployee]);

  // Fetch employees
  const { data: employees, loading: employeesLoading, error: employeesError } = useApi(() => employeeApi.getAll(), []);

  // Memoized API call for time slots
  const timeSlotsApiCall = useCallback(() => {
    if (!selectedEmployee) {
      return Promise.resolve({ success: true, data: [] });
    }
    return calendarApi.getTimeSlots({
      startDate,
      endDate: startDate, // Use Start Date as End Date, because we only need to fetch time slots for one day
      employeeId: selectedEmployee,
    });
  }, [selectedEmployee, startDate]);

  // Fetch time slots for selected date
  const { data: timeSlots, loading: slotsLoading, error: slotsError } = useApi(timeSlotsApiCall, [selectedDate, selectedEmployee]);

  const handleTimeSlotSelect = useCallback(
    (slot: TimeSlot) => {
      if (slot.available) {
        setSelectedTimeSlot(slot);
        setFormData((prev: BookingFormData) => ({
          ...prev,
          selectedTimeSlot: slot.start,
        }));
      }
    },
    [setSelectedTimeSlot, setFormData]
  );

  // Memoized TimeSlotButton component
  const TimeSlotButton = useMemo(() => {
    return ({ slot }: { slot: TimeSlot }) => (
      <button
        key={slot.start}
        onClick={() => handleTimeSlotSelect(slot)}
        disabled={!slot.available}
        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
          slot.available
            ? selectedTimeSlot?.start === slot.start
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <div className="flex items-center justify-center">
          <Clock className="w-4 h-4 mr-1" />
          {formatTime(slot.start)}
        </div>
      </button>
    );
  }, [selectedTimeSlot, handleTimeSlotSelect]);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Calendar className="w-6 h-6 mr-2" />
        Vali Sobiv Aeg
      </h2>

      {/* Date Selection */}
      <Input
        label="Kuupäev"
        type="date"
        value={selectedDate.toISOString().split("T")[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        min={new Date().toISOString().split("T")[0]}
        className="mb-6"
      />

      {/* Employee Selection */}
      <Select
        label="Töötaja"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        disabled={employeesLoading}
        placeholder={employeesLoading ? "Laadimine..." : "Kõik töötajad"}
        options={
          employees?.map((employee: Employee) => ({
            value: employee.id,
            label: employee.name,
          })) || []
        }
        helperText={employeesError ? `Viga töötajate laadimisel: ${employeesError}` : undefined}
        error={!!employeesError}
        className="mb-6"
      />

      {/* Time Slots */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Saadaolevad ajad {formatDate(selectedDate)}</h3>

        {!selectedEmployee ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Vali töötaja</p>
            <p className="text-sm">Palun vali töötaja, et näha saadaolevaid aegu</p>
          </div>
        ) : slotsError ? (
          <div className="text-center py-8 text-red-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium mb-2">Viga ajade laadimisel</p>
            <p className="text-sm">{slotsError}</p>
          </div>
        ) : slotsLoading ? (
          <div className="animate-pulse grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {timeSlots?.map((slot) => (
              <TimeSlotButton key={slot.start} slot={slot} />
            ))}
          </div>
        )}

        {selectedEmployee && timeSlots?.length === 0 && !slotsLoading && !slotsError && (
          <div className="text-center py-8 text-gray-500">Sellel päeval pole saadaolevaid aegu</div>
        )}
      </div>
    </div>
  );
};
