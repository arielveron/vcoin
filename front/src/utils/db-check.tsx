import { pool } from '@/config/database'
import { ReactNode } from 'react'

/**
 * Check if database is accessible
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

/**
 * Component to display when database connection is not available
 */
export function DatabaseConnectionError(): ReactNode {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 text-6xl mb-4">🔌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Conexión a Base de Datos Requerida
        </h1>
        <div className="text-left space-y-4 mb-6">
          <p className="text-gray-700">
            El panel de administración requiere una conexión activa a PostgreSQL para funcionar correctamente.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Para configurar la base de datos:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Instala PostgreSQL en tu sistema</li>
              <li>Inicia el servicio de PostgreSQL</li>
              <li>Configura las credenciales en <code className="bg-gray-200 px-1 rounded">.env.local</code></li>
              <li>Ejecuta <code className="bg-gray-200 px-1 rounded">npm run setup</code></li>
            </ol>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Sugerencia:</strong> Puedes usar <code className="bg-blue-100 px-1 rounded">npm run db:test</code> 
              para verificar la conexión antes de continuar.
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>Consulta la documentación en <code className="bg-gray-100 px-1 rounded">DATABASE.md</code> para más detalles.</p>
        </div>
      </div>
    </div>
  )
}
