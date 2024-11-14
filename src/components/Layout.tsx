import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          © {new Date().getFullYear()} YONCELL MULTI SERVICES
        </div>
      </footer>
    </div>
  );
};

export default Layout;