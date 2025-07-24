import { ReactNode } from "react";
import { hasAuthConfig, hasGoogleConfig } from "@/auth";

export const isAuthFullyConfigured = hasAuthConfig && hasGoogleConfig;

/**
 * Component to display when authentication is not properly configured
 */
export function AuthConfigError(): ReactNode {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuración de Autenticación Requerida</h1>
        <div className="text-left space-y-3 mb-6">
          <p className="text-gray-700">Para acceder al panel de administración, necesitas configurar:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            {!hasAuthConfig && (
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded">AUTH_SECRET</code> o{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">NEXTAUTH_SECRET</code>
              </li>
            )}
            {!hasGoogleConfig && (
              <>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_CLIENT_ID</code>
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_CLIENT_SECRET</code>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
