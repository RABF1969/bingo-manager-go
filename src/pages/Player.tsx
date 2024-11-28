import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerRegistration } from "@/components/PlayerRegistration";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface BingoCard {
  id: string;
  numbers: number[][];
  marked_numbers: number[];
  game_id: string;
}

const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [playerCard, setPlayerCard] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (!currentSession) {
          setLoading(false);
          return;
        }

        // Fetch player's card for the game
        const gameId = location.state?.gameId;
        if (gameId) {
          const { data: card, error } = await supabase
            .from('bingo_cards')
            .select('*')
            .eq('game_id', gameId)
            .eq('player_id', currentSession.user.id)
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
      } catch (error) {
        console.error('Error checking auth:', error);
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.state?.gameId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {session ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => navigate('/game-selection')} 
                variant="outline"
              >
                Voltar para Seleção de Jogos
              </Button>
            </div>
            {playerCard ? (
              <PlayerCard 
                numbers={playerCard.numbers} 
                markedNumbers={playerCard.marked_numbers}
                gameId={playerCard.game_id}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma cartela selecionada. Por favor, selecione um jogo primeiro.
                </p>
                <Button 
                  onClick={() => navigate('/game-selection')}
                  className="mt-4"
                >
                  Selecionar Jogo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <PlayerRegistration />
        )}
      </div>
    </div>
  );
};

export default Player;