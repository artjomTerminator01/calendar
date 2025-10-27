/**
 * Client header component for the public booking interface
 * Displays the main title and subtitle for the booking page
 * Provides consistent branding and navigation context
 *
 * @component
 * @returns {JSX.Element} Header with title and subtitle for client booking
 *
 * @example
 * <ClientHeader />
 */
export const ClientHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broneeri Aeg</h1>
            <p className="text-lg text-gray-600">Vali sobiv aeg ja broneeri teenus</p>
          </div>
        </div>
      </div>
    </header>
  );
};
