import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TimeSlot, BookingFormData, WorkType } from "@/types";
import { ClientBookingForm, ClientBookingTimeSelection } from "@/components/client";
import { useApiMutation } from "@/hooks/useApi";
import { notificationApi, assignmentApi } from "@/services/api";
import { constructEmployeeEmail } from "@/utils/email";

/**
 * Client booking page for public users to schedule work appointments
 * Provides a two-step booking process: time selection and form submission
 * Includes form validation, email notifications to admin, and success navigation
 * Supports all work types (measurement, maintenance, demolition, consultation)
 *
 * @component
 * @returns {JSX.Element} Client booking page with time selection and booking form
 *
 * @example
 * <ClientBooking />
 *
 * @example
 * // Booking flow:
 * // 1. User selects date and employee
 * // 2. Available time slots are displayed
 * // 3. User fills out booking form
 * // 4. Form is validated and submitted
 * // 5. Admin receives email notification
 * // 6. User is redirected to success page
 */
export const ClientBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    workType: WorkType.MEASUREMENT,
    selectedTimeSlot: "",
    comment: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutate: createBooking, loading: creating } = useApiMutation(
    (
      data: Omit<BookingFormData, "selectedTimeSlot"> & {
        startTime: string;
        endTime: string;
        employeeId: string;
      }
    ) =>
      assignmentApi.create({
        ...data,
        status: "scheduled",
      })
  );

  const validateForm = () => {
    const errors: string[] = [];

    // Validate name
    const trimmedName = formData.clientName.trim();
    if (!trimmedName || trimmedName.length < 1) {
      errors.push("Palun sisestage kehtiv nimi");
    }

    // Validate phone - generic international format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = formData.clientPhone.replace(/[\s\-\(\)]/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone) || cleanPhone.length < 7) {
      errors.push("Palun sisestage kehtiv telefoninumber");
    }

    // Validate address
    const trimmedAddress = formData.clientAddress.trim();
    if (!trimmedAddress || trimmedAddress.length < 1) {
      errors.push("Palun sisestage kehtiv aadress");
    }

    // Validate time slot and employee
    if (!selectedTimeSlot || !selectedEmployee) {
      errors.push("Palun valige aeg ja töötaja");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors([]);

    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const result = await createBooking({
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      workType: formData.workType,
      comment: formData.comment,
      startTime: selectedTimeSlot!.start,
      endTime: selectedTimeSlot!.end,
      employeeId: selectedEmployee,
    });

    if (result.success && result.data) {
      const { subject, message } = constructEmployeeEmail(result.data, false);

      await notificationApi.sendNotification({
        type: "client_booking",
        recipient: "admin@company.com",
        subject: `Uus kliendi broneering - ${subject}`,
        message,
        assignmentData: result.data,
      });

      navigate("/success");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ClientBookingTimeSelection
          setFormData={setFormData}
          selectedDate={selectedDate}
          selectedEmployee={selectedEmployee}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedDate={setSelectedDate}
          setSelectedEmployee={setSelectedEmployee}
          setSelectedTimeSlot={setSelectedTimeSlot}
        />
        <ClientBookingForm
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          creating={creating}
          validationErrors={validationErrors}
        />
      </div>
    </div>
  );
};
