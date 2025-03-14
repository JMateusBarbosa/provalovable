
import React from 'react';
import { CalendarDays } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-navy text-white shadow-md h-16 z-50 animate-fade-in">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-8 w-8 text-gold" />
          <span className="text-xl font-bold hidden sm:inline">Sistema de Agendamento de Provas</span>
          <span className="text-xl font-bold sm:hidden">Agendamento</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="bg-gold text-navy font-semibold px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 text-sm">
            Página Inicial
          </button>
          <button className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm">
            Agendar Nova Prova
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
