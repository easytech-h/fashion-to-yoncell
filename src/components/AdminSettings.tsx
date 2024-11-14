import React, { useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDefaultPermissions, UserRole } from '../types/types';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    defaultUserRole: 'user' as UserRole,
    requirePasswordChange: true,
    sessionTimeout: 30,
    maxLoginAttempts: 3
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setSuccess('Paramètres enregistrés avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des paramètres');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Paramètres Administrateur</h2>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Paramètres des Utilisateurs</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rôle par Défaut
              </label>
              <select
                value={settings.defaultUserRole}
                onChange={(e) => setSettings({ ...settings, defaultUserRole: e.target.value as UserRole })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.requirePasswordChange}
                onChange={(e) => setSettings({ ...settings, requirePasswordChange: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Exiger le changement de mot de passe à la première connexion
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Paramètres de Sécurité</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Délai d'Expiration de Session (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Maximum de Tentatives de Connexion
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Permissions par Défaut</h3>
          
          <div className="space-y-2">
            {Object.entries(getDefaultPermissions(settings.defaultUserRole)).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{key}</span>
                <span className={value ? 'text-green-600' : 'text-red-600'}>
                  {value ? 'Autorisé' : 'Non autorisé'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleSave}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="mr-2" size={18} />
            Enregistrer les Paramètres
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;