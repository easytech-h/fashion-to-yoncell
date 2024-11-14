import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { Lock, RefreshCw, AlertTriangle, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { deleteAllProducts } = useInventory();
  const { clearSales } = useSales();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (currentPassword !== 'admin') {
      setError('Current password is incorrect');
      return;
    }
    setMessage('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetSystem = () => {
    if (window.confirm('Are you sure you want to reset the entire system? This action cannot be undone.')) {
      deleteAllProducts();
      clearSales();
      setMessage('System has been reset to factory defaults');
    }
  };

  const handleCreateBackup = () => {
    const backup = {
      date: new Date().toISOString(),
      data: {
        products: localStorage.getItem('products'),
        sales: localStorage.getItem('sales'),
        orders: localStorage.getItem('orders')
      }
    };

    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMessage('Backup created successfully');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block mb-2">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-2">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Lock className="inline-block mr-2" size={18} />
            Change Password
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">System Backup</h2>
        <p className="mb-4">Create a backup of all system data including products, sales, and settings.</p>
        <button
          onClick={handleCreateBackup}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Save className="inline-block mr-2" size={18} />
          Create Backup
        </button>
      </div>

      {/* <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reset System</h2>
        <p className="mb-4 text-red-600">
          <AlertTriangle className="inline-block mr-2" size={18} />
          Warning: This action will reset the entire system to factory defaults, deleting all products, sales data, and settings. This action cannot be undone.
        </p>
        <button
          onClick={handleResetSystem}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <RefreshCw className="inline-block mr-2" size={18} />
          Reset System to Factory Defaults
        </button>
      </div> */}
      
      {(message || error) && (
        <div className={`mt-4 p-4 ${message ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded`}>
          {message || error}
        </div>
      )}
    </div>
  );
};

export default Settings;