"use client";

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aviso Importante
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 text-gray-700">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    🎓 Aplicación Educativa
                  </h4>
                  <p className="text-sm text-amber-700">
                    Esta es una aplicación diseñada exclusivamente para fines educativos. 
                    Las tasas de interés mostradas están deliberadamente exageradas para 
                    que los estudiantes puedan apreciar en 3-4 meses el crecimiento del 
                    dinero que normalmente tomaría varios años.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">
                    ⚠️ Advertencia sobre Inversiones Reales
                  </h4>
                  <p className="text-sm text-red-700 mb-2">
                    <strong>En la vida real, las tasas de interés extremadamente altas 
                    son una señal clara de fraude.</strong>
                  </p>
                  <p className="text-sm text-red-700">
                    Si alguien te ofrece inversiones con rendimientos muy superiores 
                    a los ofrecidos por bancos tradicionales o instrumentos financieros 
                    regulados, mantente alejado. Estas ofertas suelen ser esquemas 
                    Ponzi o estafas piramidales.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    💡 Consejos para Inversiones Reales
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Investiga siempre antes de invertir tu dinero</li>
                    <li>• Consulta con entidades financieras reguladas</li>
                    <li>• Si algo parece demasiado bueno para ser verdad, probablemente lo sea</li>
                    <li>• La diversificación es clave en cualquier cartera de inversión</li>
                    <li>• Nunca inviertas dinero que no puedas permitirte perder</li>
                  </ul>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    VCOIN - Simulador Educativo de Inversiones Virtuales
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
