import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Users, Activity, Settings } from 'lucide-react';
import UserManagement from './UserManagement';
import UserActivityLog from './UserActivityLog';
import AdminSettings from './AdminSettings';

const AdminDashboard: React.FC = () => {
  const { users, activities } = useUser();
  const [activeTab, setActiveTab] = useState<'users' | 'activities' | 'settings'>('users');

  const activeUsers = users.filter(user => user.active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const todayActivities = activities.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity.timestamp);
    return (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Utilisateurs Actifs</h3>
              <p className="text-3xl font-bold text-blue-600">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Administrateurs</h3>
              <p className="text-3xl font-bold text-purple-600">{adminUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Activités du Jour</h3>
              <p className="text-3xl font-bold text-green-600">{todayActivities}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="inline-block mr-2" size={18} />
              Gestion des Utilisateurs
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'activities'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('activities')}
            >
              <Activity className="inline-block mr-2" size={18} />
              Journal d'Activités
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="inline-block mr-2" size={18} />
              Paramètres
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'activities' && <UserActivityLog />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;