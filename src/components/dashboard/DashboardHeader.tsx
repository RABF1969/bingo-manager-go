import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onCreateGame: () => void;
}

export const DashboardHeader = ({ onCreateGame }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Painel Administrativo
      </h1>
      <div className="flex gap-4">
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar para Início
        </Button>
        <Button 
          onClick={onCreateGame} 
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Novo Jogo
        </Button>
      </div>
    </div>
  );
};