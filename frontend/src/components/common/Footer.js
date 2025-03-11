import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white py-3 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} StockDashX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;