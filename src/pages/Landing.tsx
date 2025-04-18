
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, Users, School } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Footer from '@/components/layout/Footer';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center">
            <CalendarDays className="h-16 w-16 text-gold mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sistema de Agendamento de Provas
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Simplifique o processo de agendamento de provas com nossa plataforma intuitiva e eficiente.
            </p>
            <Button 
              className="bg-gold hover:bg-gold/90 text-navy font-semibold"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Acessar Sistema
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-navy mb-12">
            Principais Características
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CalendarDays className="h-8 w-8 text-gold" />}
              title="Agendamento Simplificado"
              description="Interface intuitiva para agendar provas de forma rápida e eficiente."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-gold" />}
              title="Gestão de Alunos"
              description="Acompanhamento completo do histórico de provas de cada aluno."
            />
            <FeatureCard 
              icon={<School className="h-8 w-8 text-gold" />}
              title="Múltiplas Unidades"
              description="Suporte para gerenciamento de várias unidades educacionais."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-navy mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Landing;
