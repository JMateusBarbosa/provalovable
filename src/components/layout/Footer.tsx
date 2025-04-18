
import React from 'react';
import { CalendarDays, Mail, MapPin, Phone } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-6 w-6 text-gold" />
              <h3 className="font-semibold text-lg">Sistema de Agendamento</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Uma solução moderna e eficiente para o gerenciamento e agendamento de provas, 
              desenvolvida para otimizar o processo educacional.
            </p>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">(00) 0000-0000</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contato@agendamento.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <div className="space-y-2">
              <a href="/schedule" className="block text-gray-300 hover:text-gold text-sm transition-colors">
                Agendar Prova
              </a>
              <a href="/support" className="block text-gray-300 hover:text-gold text-sm transition-colors">
                Suporte
              </a>
              <a href="/about" className="block text-gray-300 hover:text-gold text-sm transition-colors">
                Sobre
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        <div className="text-center text-sm text-gray-400">
          <p>© {currentYear} Sistema de Agendamento de Provas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
