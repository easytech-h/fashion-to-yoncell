import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserActivity, UserRole } from '../types/user';
import { useAuth } from './AuthContext';
import { hashPassword } from '../utils/auth';

interface UserContextType {
  users: User[];
  activities: UserActivity[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  logActivity: (userId: string, action: string, details: string) => void;
  getActivitiesByUser: (userId: string) => UserActivity[];
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => UserActivity[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateSession } = useAuth();
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [activities, setActivities] = useState<UserActivity[]>(() => {
    const savedActivities = localStorage.getItem('userActivities');
    return savedActivities ? JSON.parse(savedActivities) : [];
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    updateSession();
  }, [users]);

  useEffect(() => {
    localStorage.setItem('userActivities', JSON.stringify(activities));
  }, [activities]);

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `USER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      password: hashPassword(userData.password)
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('system', 'USER_CREATED', `New user ${userData.username} was created`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const updatedUser = {
          ...user,
          ...updates,
          // Only hash the password if it's being updated
          password: updates.password ? hashPassword(updates.password) : user.password
        };
        logActivity(id, 'USER_UPDATED', `User ${user.username} was updated`);
        return updatedUser;
      }
      return user;
    }));
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      logActivity('system', 'USER_DELETED', `User ${user.username} was deleted`);
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const logActivity = (userId: string, action: string, details: string) => {
    const activity: UserActivity = {
      id: `ACT-${Date.now()}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [...prev, activity]);
  };

  const getActivitiesByUser = (userId: string) => {
    return activities.filter(activity => activity.userId === userId);
  };

  const getActivitiesByDateRange = (startDate: Date, endDate: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  };

  return (
    <UserContext.Provider value={{
      users,
      activities,
      addUser,
      updateUser,
      deleteUser,
      logActivity,
      getActivitiesByUser,
      getActivitiesByDateRange
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};