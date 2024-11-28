import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GameControlsProps {
  gameId: string | null;
  onCreateGame: () => void;
}

export const GameControls = ({ gameId, onCreateGame }: GameControlsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const resetGame = async () => {
    if (!gameId) {
      toast({
        title: "Erro",
        description: "Nenhum jogo selecionado para resetar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Reset drawn numbers
      await supabase
        .from('drawn_numbers')
        .delete()
        .eq('game_id', gameId);

      // Reset marked numbers on cards
      const { data: cards } = await supabase
        .from('bingo_cards')
        .select('id')
        .eq('game_id', gameId);

      if (cards) {
        for (const card of cards) {
          await supabase
            .from('bingo_cards')
            .update({ marked_numbers: [] })
            .eq('id', card.id);
        }
      }

      // Reset game status
      await supabase
        .from('games')
        .update({ 
          status: 'waiting',
          winner_card_id: null,
          finished_at: null
        })
        .eq('id', gameId);

      toast({
        title: "Jogo Resetado",
        description: "O jogo foi resetado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resetar o jogo",
        variant: "destructive",
      });
    }
  };

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
        <Button
          onClick={resetGame}
          className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          disabled={!gameId}
        >
          <RotateCcw className="h-4 w-4" />
          Resetar Jogo
        </Button>
      </div>
    </div>
  );
};