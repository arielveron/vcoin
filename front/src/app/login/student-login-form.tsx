'use client'

import { useState } from 'react';
import { studentLogin } from '@/actions/student-actions';

export default function StudentLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    registro: '',
    password: ''
  });

  // Validation functions
  const validateNumber = (value: string): boolean => {
    // Allow empty string
    if (value === '') return true;
    
    // Check if it's a valid positive integer (no decimals, no negatives)
    // Allow leading zeros (01, 001, etc.) which will be converted to proper numbers
    return /^\d+$/.test(value) && !value.includes('.') && !value.includes('-');
  };

  const validatePassword = (value: string): boolean => {
    return /^[a-zA-Z0-9\-\.\+\$\&\/\!\?]+$/.test(value);
  };

  const normalizeNumber = (value: string): string => {
    // Convert to number and back to string to remove leading zeros
    // "01" -> 1 -> "1", "001" -> 1 -> "1"
    if (value === '') return '';
    const num = parseInt(value, 10);
    return isNaN(num) ? value : num.toString();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'class_id' || field === 'registro') {
      // Only allow valid numbers (including leading zeros)
      if (validateNumber(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === 'password') {
      // Only allow valid password characters
      if (value === '' || validatePassword(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError('');

    // Get form data from the form element
    const formElement = e.currentTarget;
    const formDataObj = new FormData(formElement);

    // Get raw values and normalize numbers
    const rawClassId = formDataObj.get('class_id') as string;
    const rawRegistro = formDataObj.get('registro') as string;
    const password = formDataObj.get('password') as string;

    // Normalize numbers (remove leading zeros)
    const classId = normalizeNumber(rawClassId);
    const registro = normalizeNumber(rawRegistro);

    // Additional client-side validation
    if (!validateNumber(rawClassId)) {
      setError('Class ID must contain only numbers');
      setLoading(false);
      return;
    }

    if (!validateNumber(rawRegistro)) {
      setError('Registry Number must contain only numbers');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password contains invalid characters. Only letters, numbers, and these symbols are allowed: - . + $ & / ! ?');
      setLoading(false);
      return;
    }

    // Check for empty or invalid numbers after normalization
    if (!classId || classId === '0') {
      setError('Class ID must be a valid positive number');
      setLoading(false);
      return;
    }

    if (!registro || registro === '0') {
      setError('Registry Number must be a valid positive number');
      setLoading(false);
      return;
    }

    try {
      // Create new FormData with normalized values
      const normalizedFormData = new FormData();
      normalizedFormData.set('class_id', classId);
      normalizedFormData.set('registro', registro);
      normalizedFormData.set('password', password);

      const result = await studentLogin(normalizedFormData);
      
      // Check if the result indicates an error
      if (!result.success) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }
      
      // If successful, studentLogin will redirect to /student
    } catch (error: unknown) {
      // Handle any unexpected errors (like redirects)
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      if (errorMessage.includes('NEXT_REDIRECT')) {
        throw error; // Let redirects bubble up
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
            Class ID
          </label>
          <input
            id="class_id"
            name="class_id"
            type="text"
            required
            value={formData.class_id}
            onChange={(e) => handleInputChange('class_id', e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your class ID (numbers only)"
            pattern="[0-9]+"
          />
        </div>

        <div>
          <label htmlFor="registro" className="block text-sm font-medium text-gray-700">
            Registry Number
          </label>
          <input
            id="registro"
            name="registro"
            type="text"
            required
            value={formData.registro}
            onChange={(e) => handleInputChange('registro', e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your registry number (numbers only)"
            pattern="[0-9]+"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your password"
            pattern="[a-zA-Z0-9\-\.\+\$\&\/\!\?]+"
          />
          <p className="mt-1 text-xs text-gray-500">
            Allowed characters: letters, numbers, and symbols: - . + $ & / ! ?
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have a password? Contact your administrator to set up your account.
        </p>
      </div>
    </form>
  );
}
