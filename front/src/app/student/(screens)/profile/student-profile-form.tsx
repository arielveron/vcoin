'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSession } from '@/types/database';
import { updateStudentProfile } from '@/actions/student-actions';
import { 
  PERSONALIZACION_OPTIONS
} from '@/shared/utils/personalization';

interface StudentProfileFormProps {
  session: StudentSession;
}

export default function StudentProfileForm({ session }: StudentProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [email, setEmail] = useState(session.email);
  const [personalizacion, setPersonalizacion] = useState(session.personalizacion || '');
  const router = useRouter();

  // Update local state when session prop changes (after router.refresh())
  useEffect(() => {
    setEmail(session.email);
    setPersonalizacion(session.personalizacion || '');
  }, [session]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    // Validate passwords match if changing password
    const new_password = formData.get('new_password') as string;
    const confirm_password = formData.get('confirm_password') as string;
    
    if (new_password && new_password !== confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    // Validate current password is provided if changing password or email (but not for personalization)
    const current_password = formData.get('current_password') as string;
    
    // Convert empty string to null for comparison
    const personalizedValue = personalizacion === '' ? null : personalizacion;
    const currentPersonalizacion = session.personalizacion || null;
    
    if ((new_password || email !== session.email) && !current_password) {
      setMessage({ type: 'error', text: 'Current password is required to change password or email' });
      setLoading(false);
      return;
    }

    // Remove confirm_password from form data and use local state values
    const submitFormData = new FormData();
    submitFormData.append('email', email);
    submitFormData.append('personalizacion', personalizacion);
    if (current_password) {
      submitFormData.append('current_password', current_password);
    }
    if (new_password) {
      submitFormData.append('new_password', new_password);
    }

    try {
      await updateStudentProfile(submitFormData);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Reset password fields only
      const form = document.getElementById('profile-form') as HTMLFormElement;
      if (form) {
        const currentPasswordInput = form.querySelector('#current_password') as HTMLInputElement;
        const newPasswordInput = form.querySelector('#new_password') as HTMLInputElement;
        const confirmPasswordInput = form.querySelector('#confirm_password') as HTMLInputElement;
        
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
      }
      
      // For personalization or email changes, reload the page to get fresh session data
      if (email !== session.email || personalizedValue !== currentPersonalizacion) {
        // Use window.location.reload() for a more reliable refresh
        window.location.reload();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="profile-form" action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personalización</h3>
        <p className="text-sm text-gray-600 mb-4">
          Elige cómo prefieres que aparezcan ciertos nombres en la aplicación. Esta configuración 
          afecta la forma en que se muestran algunos logros y contenido personalizado.
        </p>
        
        <div>
          <label htmlFor="personalizacion" className="block text-sm font-medium text-gray-700 mb-2">
            Preferencia de personalización
          </label>
          <select
            id="personalizacion"
            name="personalizacion"
            value={personalizacion}
            onChange={(e) => setPersonalizacion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {PERSONALIZACION_OPTIONS.map((option) => (
              <option key={option.value || 'null'} value={option.value || ''}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Required to make any changes"
            />
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Leave blank to keep current password"
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/student')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
