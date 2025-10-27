import { useState, useEffect } from "react";

import { ApiResponse } from "@/types";
import { useNotification } from "@/contexts/NotificationContext";

/**
 * State interface for API hooks
 * @template T - The type of data being fetched
 */
interface UseApiState<T> {
  data: T | null; // The fetched data, null if not loaded yet
  loading: boolean; // True when API call is in progress
  error: string | null; // Error message if API call failed, null if successful
}

/**
 * Custom hook for fetching data from API endpoints
 * Automatically handles loading states, error handling, and re-fetching when dependencies change
 *
 * @template T - The type of data being fetched
 * @param apiCall - Function that returns a Promise with API response
 * @param dependencies - Array of dependencies that trigger re-fetch when changed (like useEffect)
 * @returns Object with { data, loading, error, refetch }
 *
 * @example
 * // Fetch employees on component mount
 * const { data: employees, loading, error } = useApi(
 *   () => employeeApi.getAll(),
 *   []
 * );
 *
 * @example
 * // Re-fetch when selectedDate or selectedEmployee changes
 * const { data: timeSlots, loading, error } = useApi(
 *   () => calendarApi.getTimeSlots({ startDate, employeeId }),
 *   [selectedDate, selectedEmployee]
 * );
 */
export const useApi = <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) => {
  const { showError } = useNotification();

  // Initialize state with loading: true since we start fetching immediately
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      // Set loading state and clear any previous errors
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Make the API call
      const response = await apiCall();

      // Handle successful response
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      } else {
        // Handle API error response
        const errorMessage =
          response.message || response.error || "Unknown error";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        showError(errorMessage, "API Viga");
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      showError(errorMessage, "Võrgu Viga");
    }
  };

  useEffect(() => {
    // Execute the fetch function
    fetchData();
  }, dependencies); // Re-run when dependencies change

  return { ...state, refetch: fetchData };
};

/**
 * Custom hook for API mutations (POST, PUT, DELETE operations)
 * Provides manual triggering of API calls with loading states and error handling
 *
 * @template T - The type of data returned by the mutation
 * @template P - The type of parameters passed to the mutation function
 * @param mutationFn - Function that performs the API mutation
 * @returns Object with { data, loading, error, mutate }
 *
 * @example
 * // Create a new booking
 * const { mutate: createBooking, loading: creating, error } = useApiMutation(
 *   (data: BookingData) => assignmentApi.create(data)
 * );
 *
 * const handleSubmit = async () => {
 *   const result = await createBooking({
 *     clientName: "John Doe",
 *     clientPhone: "+372 5123 4567"
 *   });
 *
 *   if (result.success) {
 *     // Handle success
 *   }
 * };
 */
export const useApiMutation = <T, P = any>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>
) => {
  const { showError, showSuccess } = useNotification();

  // Initialize state with loading: false since mutations are triggered manually
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Function to trigger the mutation
   * @param params - Parameters to pass to the mutation function
   * @returns Promise with the API response
   */
  const mutate = async (params: P) => {
    try {
      // Set loading state and clear any previous errors
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Execute the mutation
      const response = await mutationFn(params);

      // Handle successful response
      if (response.success) {
        setState({ data: response.data || null, loading: false, error: null });

        // Show success notification if message is provided
        if (response?.message) {
          showSuccess(response.message);
        }

        return response;
      } else {
        // Handle API error response
        const errorMessage =
          response.message || response.error || "Unknown error";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        showError(errorMessage, "API Viga");
        return response;
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      showError(errorMessage, "Võrgu Viga");
      return { success: false, error: errorMessage };
    }
  };

  // Return state and the mutate function
  return { ...state, mutate };
};
