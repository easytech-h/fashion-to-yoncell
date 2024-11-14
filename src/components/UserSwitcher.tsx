import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Users, User } from 'lucide-react';

const UserSwitcher: React.FC = () => {
  const { users, currentUser, login } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSwitch = async (username: string, password: string) => {
    try {
      const success = await login(username, password);
      if (success) {
        setIsOpen(false);
      } else {
        console.error('Failed to switch user');
      }
    } catch (error) {
      console.error('Error switching user:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-indigo-500 hover:text-white rounded-md"
      >
        <Users size={20} />
        <span>Switch User</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserSwitch(user.username, user.password)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  currentUser?.id === user.id ? 'bg-gray-100' : ''
                }`}
                role="menuitem"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-700">
                      {getInitials(user.fullName)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;