import { Dispatch, SetStateAction } from "react";
import { User, CheckCircle } from "lucide-react";

import { BookingFormData, TimeSlot } from "@/types";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { formatTime, formatDate } from "@/utils/helpers";

/**
 * Props interface for ClientBookingForm component
 * @interface ClientBookingFormProps
 * @property {Function} handleSubmit - Form submission handler
 * @property {BookingFormData} formData - Current form data state
 * @property {Dispatch<SetStateAction<BookingFormData>>} setFormData - Form data setter function
 * @property {Date} selectedDate - Currently selected date
 * @property {TimeSlot | null} selectedTimeSlot - Currently selected time slot
 * @property {boolean} creating - Loading state for form submission
 * @property {string[]} validationErrors - Array of validation error messages
 */
interface ClientBookingFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  formData: BookingFormData;
  setFormData: Dispatch<SetStateAction<BookingFormData>>;
  selectedDate: Date;
  selectedTimeSlot: TimeSlot | null;
  creating: boolean;
  validationErrors: string[];
}

/**
 * Client booking form component for collecting customer information
 * Provides form fields for name, phone, address, work type, and comments
 * Includes validation error display and submit button with loading state
 * Shows selected time slot confirmation and disables submit until all required fields are filled
 *
 * @component
 * @param {ClientBookingFormProps} props - Component props
 * @returns {JSX.Element} Booking form with validation and submission handling
 *
 * @example
 * <ClientBookingForm
 *   handleSubmit={handleSubmit}
 *   formData={formData}
 *   setFormData={setFormData}
 *   selectedDate={selectedDate}
 *   selectedTimeSlot={selectedTimeSlot}
 *   creating={creating}
 *   validationErrors={validationErrors}
 * />
 */
export const ClientBookingForm = ({
  handleSubmit,
  formData,
  setFormData,
  selectedDate,
  selectedTimeSlot,
  creating,
  validationErrors,
}: ClientBookingFormProps) => {
  const isSubmitDisabled = !selectedTimeSlot || !formData.clientName || !formData.clientPhone || !formData.clientAddress || creating;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <User className="w-6 h-6 mr-2" />
        Broneeringu Andmed
      </h2>

      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Palun parandage järgmised vead:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Teie nimi"
          type="text"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          placeholder="Sisestage oma täisnimi"
          required
        />

        <Input
          label="Telefon"
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
          placeholder="+372 5930 3950"
          required
        />

        <Input
          label="Aadress"
          type="text"
          value={formData.clientAddress}
          onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
          placeholder="Sisestage täielik aadress"
          required
        />

        <Select
          label="Teenuse tüüp"
          value={formData.workType}
          onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
          options={[
            { value: "measurement", label: "Mõõdistus" },
            { value: "maintenance", label: "Hooldus" },
            { value: "demolition", label: "Lammutus" },
            { value: "consultation", label: "Konsultatsioon" },
          ]}
          required
        />

        <Textarea
          label="Lisainfo (valikuline)"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          rows={3}
          placeholder="Kirjeldage oma vajadusi..."
        />

        {selectedTimeSlot && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center text-primary-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Valitud aeg:</span>
            </div>
            <p className="text-primary-700 mt-1">
              {formatDate(selectedDate)} kell {formatTime(selectedTimeSlot.start)}
            </p>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" disabled={isSubmitDisabled} loading={creating} className="w-full">
          {creating ? (
            "Broneerimine..."
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Broneeri Aeg
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
