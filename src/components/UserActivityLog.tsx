import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { UserActivity } from '../types/user';
import { Calendar, Search, Filter } from 'lucide-react';

const UserActivityLog: React.FC = () => {
  const { activities, users } = useUser();
  const { orders } = useOrders();
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activityType, setActivityType] = useState('all');

  useEffect(() => {
    filterActivities();
  }, [activities, orders, searchTerm, startDate, endDate, activityType]);

  const filterActivities = () => {
    let filtered = [...activities];

    // Add completed orders to activities
    const orderActivities = orders
      .filter(order => order.status === 'completed')
      .map(order => ({
        id: `ORDER-${order.id}`,
        userId: order.createdBy || 'system',
        action: 'ORDER_COMPLETED',
        details: `Commande ${order.id} complétée - Client: ${order.customerName} - Montant: HTG ${order.finalAmount.toFixed(2)}`,
        timestamp: order.orderDate
      }));

    filtered = [...filtered, ...orderActivities];

    if (searchTerm) {
      filtered = filtered.filter(activity => {
        const user = users.find(u => u.id === activity.userId);
        return (
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (startDate) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= new Date(startDate)
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) <= endDateTime
      );
    }

    if (activityType !== 'all') {
      filtered = filtered.filter(activity => 
        activityType === 'orders' 
          ? activity.action.includes('ORDER')
          : !activity.action.includes('ORDER')
      );
    }

    // Sort activities by timestamp in descending order (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredActivities(filtered);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityTypeColor = (action: string) => {
    if (action.includes('ORDER')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Journal d'Activités</h1>

      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des activités..."
              className="w-full p-2 pl-10 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <span>à</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={18} />
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="all">Toutes les activités</option>
              <option value="orders">Commandes complétées</option>
              <option value="other">Autres activités</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const user = users.find(u => u.id === activity.userId);
              const uniqueKey = `${activity.id}-${activity.timestamp}`;
              
              return (
                <tr key={uniqueKey}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(activity.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user?.username || 'System'}</div>
                    <div className="text-sm text-gray-500">{user?.fullName || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityTypeColor(activity.action)}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{activity.details}</td>
                </tr>
              );
            })}
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Aucune activité trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivityLog;