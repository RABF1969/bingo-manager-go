import { useState } from 'react';
import { AdminDashboard } from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [mode, setMode] = useState<'admin' | 'player' | null>(null);
  const navigate = useNavigate();

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Bingo Virtual</h1>
          <p className="text-xl text-muted-foreground mb-8">Escolha seu papel para começar</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setMode('admin')}
            className="px-8 py-6 text-lg"
            variant="outline"
          >
            Administrador
          </Button>
          <Button
            onClick={() => navigate('/player')}
            className="px-8 py-6 text-lg"
            variant="default"
          >
            Jogador
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <Button
          onClick={() => setMode(null)}
          variant="ghost"
          className="mb-4"
        >
          Voltar para Seleção de Papel
        </Button>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default Index;