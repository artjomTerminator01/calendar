import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import { Employee } from "@/types";
import { Button } from "@/components/ui";
import { EmployeeModal, EmployeeCard } from "@/components/admin";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { employeeApi } from "@/services/api";

/**
 * Employee management page for creating, editing, and deleting employees
 * Provides CRUD operations for employee data including work hours
 * Uses modal for form interactions and cards for display
 *
 * @component
 * @returns {JSX.Element} Employee management page with list and modal
 *
 * @example
 * <EmployeeManagement />
 */
export const EmployeeManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: employees, loading, error } = useApi(() => employeeApi.getAll(), [refreshTrigger]);

  const { mutate: createEmployee, loading: creating } = useApiMutation((data: Omit<Employee, "id">) => employeeApi.create(data));

  const { mutate: updateEmployee, loading: updating } = useApiMutation(({ id, data }: { id: string; data: Partial<Employee> }) =>
    employeeApi.update(id, data)
  );

  const { mutate: deleteEmployee } = useApiMutation((id: string) => employeeApi.delete(id));

  const handleSubmit = async (data: Omit<Employee, "id">) => {
    const result = editingEmployee ? await updateEmployee({ id: editingEmployee.id, data }) : await createEmployee(data);

    if (result.success) {
      // Trigger refresh by updating the dependency
      setRefreshTrigger((prev) => prev + 1);

      setShowModal(false);
      setEditingEmployee(null);
    }
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleEmployeeDelete = async (id: string) => {
    if (confirm("Kas olete kindel, et soovite selle töötaja kustutada?")) {
      const result = await deleteEmployee(id);

      if (result.success) {
        // Trigger refresh by updating the dependency
        setRefreshTrigger((prev) => prev + 1);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Töötajate Haldamine</h1>
        <p className="page-subtitle">Lisa, muuda ja kustuta töötajaid</p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Töötajad</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Lisa Töötaja
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">Viga andmete laadimisel: {error}</div>
        ) : (
          <div className="space-y-4">
            {employees?.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                actions={
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEmployeeEdit(employee)} className="flex items-center">
                      <Edit className="w-4 h-4 mr-1" />
                      Muuda
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEmployeeDelete(employee.id)}
                      className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Kustuta
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      <EmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingEmployee={editingEmployee}
        loading={creating || updating}
      />
    </div>
  );
};
