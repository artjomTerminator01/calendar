import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { Employee } from "@/types";
import { Button, Input, DateTimePicker } from "@/components/ui";

/**
 * Props interface for EmployeeModal component
 * @interface EmployeeModalProps
 * @property {boolean} isOpen - Whether the modal is visible
 * @property {Function} onClose - Function to close the modal
 * @property {Function} onSubmit - Function to handle form submission
 * @property {Employee | null} [editingEmployee] - Employee being edited (null for new employee)
 * @property {boolean} [loading] - Whether the form is in loading state
 */
export interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, "id">) => Promise<void>;
  editingEmployee?: Employee | null;
  loading?: boolean;
}

/**
 * Initial form state for employee modal
 * @constant
 * @type {Object}
 */
const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  workHours: { start: "08:00", end: "16:30" },
};

/**
 * Modal component for creating and editing employees
 * Provides form fields for name, email, and work hours configuration
 * Supports both creation and editing modes with form state management
 * Uses time picker components for work hours with 24-hour format
 * Includes proper form validation and loading states
 *
 * @component
 * @param {EmployeeModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with employee form
 *
 * @example
 * <EmployeeModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={handleSubmit}
 *   editingEmployee={selectedEmployee}
 *   loading={creating}
 * />
 */
export const EmployeeModal = ({ isOpen, onClose, onSubmit, editingEmployee, loading = false }: EmployeeModalProps) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Reset form when modal opens/closes or when editing employee changes
  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        setFormData({
          name: editingEmployee.name,
          email: editingEmployee.email,
          workHours: editingEmployee.workHours,
        });
      } else {
        setFormData(INITIAL_FORM_STATE);
      }
    }
  }, [isOpen, editingEmployee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{editingEmployee ? "Muuda Töötajat" : "Lisa Uus Töötaja"}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nimi" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

          <div className="grid grid-cols-2 gap-4">
            <DateTimePicker
              label="Töö algus"
              value={formData.workHours.start}
              onChange={(time) =>
                setFormData({
                  ...formData,
                  workHours: {
                    ...formData.workHours,
                    start: time as string,
                  },
                })
              }
              timeOnly
              required
            />

            <DateTimePicker
              label="Töö lõpp"
              value={formData.workHours.end}
              onChange={(time) =>
                setFormData({
                  ...formData,
                  workHours: {
                    ...formData.workHours,
                    end: time as string,
                  },
                })
              }
              timeOnly
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Tühista
            </Button>
            <Button type="submit" variant="primary" disabled={loading} loading={loading}>
              {loading ? "Salvestamine..." : "Salvesta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
