import React from 'react';

interface ProfitSummaryCardsProps {
  totalNetProfit: number;
  totalRealProfit: number;
  finalNetProfit: number;
}

const ProfitSummaryCards: React.FC<ProfitSummaryCardsProps> = ({
  totalNetProfit,
  totalRealProfit,
  finalNetProfit
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Bénéfice net total</h3>
        <p className="text-2xl font-bold text-green-600">HTG {totalNetProfit.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Basé sur l'inventaire actuel et les prix</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Total bénéfice réél</h3>
        <p className="text-2xl font-bold text-blue-600">HTG {totalRealProfit.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Basé sur les ventes réelles</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Bénéfice net final</h3>
        <p className="text-2xl font-bold text-purple-600">HTG {finalNetProfit.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Après dépenses</p>
      </div>
    </div>
  );
};

export default ProfitSummaryCards;