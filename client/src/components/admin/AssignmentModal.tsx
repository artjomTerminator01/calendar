import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { WorkAssignment, WorkType, AssignmentStatus } from "@/types";
import { Button, Input, Select, Textarea, DateTimePicker } from "@/components/ui";

/**
 * Props interface for AssignmentModal component
 * @interface AssignmentModalProps
 * @property {boolean} isOpen - Whether the modal is visible
 * @property {Function} onClose - Function to close the modal
 * @property {Function} onSubmit - Function to handle form submission
 * @property {WorkAssignment | null} [editingAssignment] - Assignment being edited (null for new assignment)
 * @property {Array<{id: string; name: string}>} [employees] - List of available employees
 * @property {boolean} [loading] - Whether the form is in loading state
 */
export interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editingAssignment?: WorkAssignment | null;
  employees?: Array<{ id: string; name: string }>;
  loading?: boolean;
}

/**
 * Initial form state for assignment modal
 * @constant
 * @type {Object}
 */
const INITIAL_FORM_STATE = {
  employeeId: "",
  clientName: "",
  clientPhone: "",
  clientAddress: "",
  workType: WorkType.MEASUREMENT,
  startTime: new Date(),
  endTime: new Date(),
  comment: "",
  status: AssignmentStatus.SCHEDULED,
};

/**
 * Modal component for creating and editing work assignments
 * Provides comprehensive form with employee selection, client details, work type, and scheduling
 * Supports both creation and editing modes with form state management
 * Includes status selection for editing existing assignments
 * Uses responsive grid layout and proper form validation
 *
 * @component
 * @param {AssignmentModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with assignment form
 *
 * @example
 * <AssignmentModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={handleSubmit}
 *   editingAssignment={selectedAssignment}
 *   employees={employees}
 *   loading={creating}
 * />
 */
export const AssignmentModal = ({ isOpen, onClose, onSubmit, editingAssignment, employees = [], loading = false }: AssignmentModalProps) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Reset form when modal opens/closes or when editing assignment changes
  useEffect(() => {
    if (isOpen) {
      if (editingAssignment) {
        setFormData({
          employeeId: editingAssignment.employeeId,
          clientName: editingAssignment.clientName,
          clientPhone: editingAssignment.clientPhone,
          clientAddress: editingAssignment.clientAddress,
          workType: editingAssignment.workType,
          startTime: new Date(editingAssignment.startTime),
          endTime: new Date(editingAssignment.endTime),
          comment: editingAssignment.comment || "",
          status: editingAssignment.status as AssignmentStatus,
        });
      } else {
        setFormData(INITIAL_FORM_STATE);
      }
    }
  }, [isOpen, editingAssignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      startTime: formData.startTime.toISOString(),
      endTime: formData.endTime.toISOString(),
    });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{editingAssignment ? "Muuda Tööülesannet" : "Lisa Uus Tööülesanne"}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Töötaja"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              options={[
                { value: "", label: "Vali töötaja" },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: employee.name,
                })),
              ]}
              required
            />

            <Select
              label="Töö tüüp"
              value={formData.workType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workType: e.target.value as WorkType,
                })
              }
              options={[
                { value: WorkType.MEASUREMENT, label: "Mõõdistus" },
                { value: WorkType.MAINTENANCE, label: "Hooldus" },
                { value: WorkType.DEMOLITION, label: "Lammutus" },
                { value: WorkType.CONSULTATION, label: "Konsultatsioon" },
              ]}
              required
            />
          </div>

          {editingAssignment && (
            <Select
              label="Staatus"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AssignmentStatus,
                })
              }
              options={[
                { value: AssignmentStatus.SCHEDULED, label: "Planeeritud" },
                { value: AssignmentStatus.COMPLETED, label: "Lõpetatud" },
                { value: AssignmentStatus.CANCELLED, label: "Tühistatud" },
              ]}
              required
            />
          )}

          <Input
            label="Kliendi nimi"
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              required
            />

            <Input
              label="Aadress"
              type="text"
              value={formData.clientAddress}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clientAddress: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Algusaeg"
              value={formData.startTime}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  startTime: (date as Date) || new Date(),
                })
              }
              required
            />

            <DateTimePicker
              label="Lõppaeg"
              value={formData.endTime}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  endTime: (date as Date) || new Date(),
                })
              }
              required
            />
          </div>

          <Textarea label="Kommentaar" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} rows={3} />

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
