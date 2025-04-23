
import React from 'react';

const Footer = () => (
  <footer className="w-full text-center py-4 bg-gray-100 border-t border-gray-200">
    <div className="flex flex-col items-center justify-center">
      <span className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Indústria do Saber - Todos os direitos reservados.</span>
    </div>
  </footer>
);

export default Footer;
