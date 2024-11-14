import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Accès Refusé
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;