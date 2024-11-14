import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import DailySalesChart from './DailySalesChart';

const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const { sales } = useSales();

  const totalProducts = products.length;
  const soldProducts = sales.reduce((acc, sale) => 
    acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0
  );
  const availableProducts = products.reduce((acc, product) => acc + product.quantity, 0);
  const lowStockProducts = products.filter(product => product.quantity < 5).length;

  const Widget: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ 
    title, 
    value, 
    icon, 
    color 
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center ${color}`}>
      <div className="mr-4">{icon}</div>
      <div>
        <h3 className="text-sm sm:text-lg font-semibold">{title}</h3>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Tableau de Bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Widget 
          title="Total Produits" 
          value={totalProducts} 
          icon={<Package size={24} />} 
          color="text-blue-600" 
        />
        <Widget 
          title="Produits Vendus" 
          value={soldProducts} 
          icon={<ShoppingCart size={24} />} 
          color="text-green-600" 
        />
        <Widget 
          title="Stock Disponible" 
          value={availableProducts} 
          icon={<DollarSign size={24} />} 
          color="text-yellow-600" 
        />
        <Widget 
          title="Stock Faible" 
          value={lowStockProducts} 
          icon={<AlertTriangle size={24} />} 
          color="text-red-600" 
        />
      </div>

      {/* Daily Sales Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Évolution des Ventes</h2>
        <DailySalesChart sales={sales} days={7} />
      </div>

      {lowStockProducts > 0 && (
        <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Attention: {lowStockProducts} produit{lowStockProducts > 1 ? 's' : ''} en stock faible
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Statistiques d'Inventaire</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Produits en Stock:</span>
              <span className="font-semibold">{availableProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Valeur Totale du Stock:</span>
              <span className="font-semibold">
                HTG {products.reduce((acc, product) => acc + (product.price * product.quantity), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Statistiques des Ventes</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Nombre de Ventes:</span>
              <span className="font-semibold">{sales.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Moyenne par Vente:</span>
              <span className="font-semibold">
                HTG {sales.length > 0 ? (sales.reduce((acc, sale) => acc + sale.total, 0) / sales.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;