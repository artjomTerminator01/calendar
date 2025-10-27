import { Outlet } from "react-router-dom";
import { ClientHeader } from "./ClientHeader";

/**
 * Client layout component providing the main structure for client pages
 * Wraps client pages with header and main content area
 * Uses React Router Outlet for nested route rendering
 * Provides consistent styling and layout for the public booking interface
 *
 * @component
 * @returns {JSX.Element} Layout wrapper with header and outlet for client pages
 *
 * @example
 * <ClientLayout />
 *
 * @example
 * // Used in routing:
 * <Route path="/" element={<ClientLayout />}>
 *   <Route index element={<ClientBooking />} />
 *   <Route path="success" element={<SuccessPage />} />
 * </Route>
 */
export const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
