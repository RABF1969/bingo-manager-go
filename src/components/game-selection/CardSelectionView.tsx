import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CardSelectionCarousel } from "./CardSelectionCarousel";

interface CardSelectionViewProps {
  gameId: string;
  onBack: () => void;
}

export const CardSelectionView = ({ gameId, onBack }: CardSelectionViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [joiningGame, setJoiningGame] = useState(false);

  const generateCards = () => {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const numbers = Array(5).fill(null).map(() => Array(5).fill(0));
      
      const ranges = [
        { min: 1, max: 15 },
        { min: 16, max: 30 },
        { min: 31, max: 45 },
        { min: 46, max: 60 },
        { min: 61, max: 75 }
      ];

      for (let col = 0; col < 5; col++) {
        const { min, max } = ranges[col];
        const columnNumbers = [];
        
        while (columnNumbers.length < 5) {
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!columnNumbers.includes(num)) {
            columnNumbers.push(num);
          }
        }
        
        columnNumbers.sort((a, b) => a - b);
        
        for (let row = 0; row < 5; row++) {
          numbers[row][col] = columnNumbers[row];
        }
      }

      numbers[2][2] = 0;
      
      cards.push({
        id: `card-${i + 1}`,
        numbers: numbers,
      });
    }
    return cards;
  };

  const handleJoinGame = async () => {
    if (!selectedCard) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma cartela primeiro.",
        variant: "destructive"
      });
      return;
    }

    setJoiningGame(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/player');
        return;
      }

      const selectedCardData = generateCards().find(card => card.id === selectedCard);
      if (!selectedCardData) {
        throw new Error("Cartela não encontrada");
      }

      const { error: insertError } = await supabase
        .from('bingo_cards')
        .insert([
          {
            game_id: gameId,
            player_id: session.user.id,
            numbers: selectedCardData.numbers,
            marked_numbers: [],
            selected: true
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: "Você entrou no jogo com sucesso.",
      });

      navigate('/player', { state: { gameId } });
    } catch (error: any) {
      console.error('Error joining game:', error);
      toast({
        title: "Erro ao entrar no jogo",
        description: error.message || "Não foi possível entrar no jogo selecionado.",
        variant: "destructive"
      });
    } finally {
      setJoiningGame(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
          Escolha sua cartela
        </h3>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="hover:bg-primary/10"
        >
          Voltar
        </Button>
      </div>
      
      <CardSelectionCarousel
        availableCards={generateCards()}
        selectedCard={selectedCard}
        onCardSelect={setSelectedCard}
      />

      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleJoinGame}
          disabled={!selectedCard || joiningGame}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 px-8 py-2 text-lg"
        >
          {joiningGame ? 'Entrando...' : 'Confirmar Seleção'}
        </Button>
      </div>
    </div>
  );
};