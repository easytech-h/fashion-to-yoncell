import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-4 text-center">
      <p>© {new Date().getFullYear()} EASYTECH STOCK</p>
      <p className="text-sm">Développé par ING Jude-Hawens</p>
    </footer>
  );
};

export default Footer;