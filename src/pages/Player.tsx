import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerRegistration } from "@/components/PlayerRegistration";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface BingoCard {
  id: string;
  numbers: number[][];
  marked_numbers: number[];
  game_id: string;
}

interface SupabaseBingoCard {
  id: string;
  numbers: string | number[][];
  marked_numbers: string | number[];
  game_id: string;
  created_at: string;
  player_id: string;
  selected: boolean | null;
}

const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [playerCard, setPlayerCard] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      // Fetch player's card for the game
      const gameId = location.state?.gameId;
      if (gameId) {
        const { data: card, error } = await supabase
          .from('bingo_cards')
          .select('*')
          .eq('game_id', gameId)
          .eq('player_id', session.user.id)
          .single();

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar sua cartela.",
            variant: "destructive"
          });
        } else if (card) {
          // Parse the JSON data from Supabase
          const parsedCard: BingoCard = {
            id: card.id,
            numbers: typeof card.numbers === 'string' ? JSON.parse(card.numbers) : card.numbers,
            marked_numbers: typeof card.marked_numbers === 'string' ? JSON.parse(card.marked_numbers) : card.marked_numbers,
            game_id: card.game_id
          };
          setPlayerCard(parsedCard);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, location.state?.gameId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p>Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {playerCard ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => navigate('/game-selection')} 
                variant="outline"
              >
                Voltar para Seleção de Jogos
              </Button>
            </div>
            <PlayerCard 
              numbers={playerCard.numbers} 
              markedNumbers={playerCard.marked_numbers}
              gameId={playerCard.game_id}
            />
          </div>
        ) : (
          <PlayerRegistration />
        )}
      </div>
    </div>
  );
};

export default Player;