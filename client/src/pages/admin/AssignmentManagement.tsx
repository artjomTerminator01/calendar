import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";

import { WorkAssignment } from "@/types";
import { AssignmentModal, AssignmentCard } from "@/components/admin";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { assignmentApi, employeeApi, notificationApi } from "@/services/api";
import { constructEmployeeEmail } from "@/utils/email";

/**
 * Assignment management page for creating, editing, and deleting work assignments
 * Provides CRUD operations with email notifications to employees
 * Supports URL-based editing via search parameters
 *
 * @component
 * @returns {JSX.Element} Assignment management page with list and modal
 *
 * @example
 * <AssignmentManagement />
 *
 * @example
 * // Navigate with edit parameter to pre-open assignment
 * navigate('/admin/assignments?edit=assignment-123')
 */
export const AssignmentManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WorkAssignment | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: assignments, loading, error } = useApi(() => assignmentApi.getAll(), [refreshTrigger]);
  const { data: employees } = useApi(() => employeeApi.getAll(), []);

  const { mutate: createAssignment, loading: creating } = useApiMutation((data: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">) =>
    assignmentApi.create(data)
  );

  const { mutate: updateAssignment, loading: updating } = useApiMutation(({ id, data }: { id: string; data: Partial<WorkAssignment> }) =>
    assignmentApi.update(id, data)
  );

  const { mutate: deleteAssignment } = useApiMutation((id: string) => assignmentApi.delete(id));

  // Handle URL parameter to pre-open assignment for editing
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && assignments) {
      const assignment = assignments.find((a) => a.id === editId);
      if (assignment) {
        setEditingAssignment(assignment);
        setShowModal(true);
      }
    }
  }, [searchParams, assignments]);

  const handleSubmit = async (data: Omit<WorkAssignment, "id" | "createdAt" | "updatedAt">) => {
    const result = editingAssignment ? await updateAssignment({ id: editingAssignment.id, data }) : await createAssignment(data);

    if (result.success) {
      // Send email notification to employee
      try {
        const employee = employees?.find((emp) => emp.id === data.employeeId);
        if (employee?.email) {
          const notificationType = editingAssignment ? "assignment_updated" : "assignment_created";
          const { subject, message } = constructEmployeeEmail(data, !!editingAssignment);

          await notificationApi.sendNotification({
            type: notificationType,
            recipient: employee.email,
            subject,
            message,
            assignmentData: data,
          });
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }

      // Trigger refresh by updating the dependency
      setRefreshTrigger((prev) => prev + 1);

      handleCloseModal();
    }
  };

  const handleEdit = (assignment: WorkAssignment) => {
    setEditingAssignment(assignment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    // Clear URL parameters when closing modal
    setSearchParams({});
  };

  const handleDelete = async (id: string) => {
    if (confirm("Kas olete kindel, et soovite selle tööülesande kustutada?")) {
      const result = await deleteAssignment(id);

      if (result.success) {
        // Trigger refresh by updating the dependency
        setRefreshTrigger((prev) => prev + 1);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tööülesannete Haldamine</h1>
        <p className="page-subtitle">Lisa, muuda ja kustuta tööülesandeid</p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tööülesanded</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Lisa Tööülesanne
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">Viga andmete laadimisel: {error}</div>
        ) : (
          <div className="space-y-4">
            {assignments?.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                employeeName={employees?.find((emp) => emp.id === assignment.employeeId)?.name}
                actions={
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(assignment)} className="btn-secondary flex items-center">
                      <Edit className="w-4 h-4 mr-1" />
                      Muuda
                    </button>
                    <button onClick={() => handleDelete(assignment.id)} className="btn-danger flex items-center">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Kustuta
                    </button>
                  </div>
                }
              />
            ))}

            {assignments?.length === 0 && <div className="text-center py-8 text-gray-500">Tööülesandeid pole veel loodud</div>}
          </div>
        )}
      </div>

      <AssignmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingAssignment={editingAssignment}
        employees={employees || []}
        loading={creating || updating}
      />
    </div>
  );
};
