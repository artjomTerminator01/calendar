import { Link } from "react-router-dom";
import { CheckCircle, Home, Calendar } from "lucide-react";

/**
 * Success page displayed after successful booking completion
 * Provides confirmation message and navigation options
 * Allows users to book again or access admin view
 * Uses success styling with checkmark icon for visual confirmation
 *
 * @component
 * @returns {JSX.Element} Success confirmation page with navigation options
 *
 * @example
 * <SuccessPage />
 *
 * @example
 * // Navigation after successful booking:
 * // - "Broneeri Veel" -> returns to booking page (/)
 * // - "Administraatori Vaade" -> goes to admin dashboard (/admin)
 */
export const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Broneering Edukalt Tehtud!</h1>

        <p className="text-gray-600 mb-6">
          Teie broneering on kinnitatud. Saadame teile kinnituse emaili ja võtame teiega ühendust enne teenuse osutamist.
        </p>

        <div className="space-y-3">
          <Link to="/" className="w-full btn-primary flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Broneeri Veel
          </Link>

          <Link to="/admin" className="w-full btn-secondary flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" />
            Administraatori Vaade
          </Link>
        </div>
      </div>
    </div>
  );
};
