/**
 * Admin header component for the administrative interface
 * Displays the main title and subtitle for the admin dashboard
 * Provides consistent branding and navigation context for admin users
 *
 * @component
 * @returns {JSX.Element} Header with title and subtitle for admin interface
 *
 * @example
 * <AdminHeader />
 */
export const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Ressursside Haldamise Kalender</h1>
        <p className="text-sm text-gray-600">Administraatori vaade</p>
      </div>
    </header>
  );
};
