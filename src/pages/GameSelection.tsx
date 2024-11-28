import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PlayerCard } from "@/components/PlayerCard";

interface Game {
  id: string;
  status: string;
  created_at: string;
}

interface BingoCard {
  id: string;
  numbers: number[][];
}

const GameSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [availableCards, setAvailableCards] = useState<BingoCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [joiningGame, setJoiningGame] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/player');
        return;
      }
    };

    checkAuth();
    fetchGames();
  }, [navigate]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGames(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar jogos",
        description: "Não foi possível carregar a lista de jogos disponíveis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCards = () => {
    const cards: BingoCard[] = [];
    for (let i = 0; i < 3; i++) {
      const numbers: number[][] = [];
      const usedNumbers = new Set<number>();

      for (let row = 0; row < 5; row++) {
        const rowNumbers: number[] = [];
        const min = row * 15 + 1;
        const max = min + 14;

        for (let col = 0; col < 5; col++) {
          let number;
          do {
            number = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (usedNumbers.has(number));

          usedNumbers.add(number);
          rowNumbers.push(number);
        }
        numbers.push(rowNumbers);
      }

      numbers[2][2] = 0;

      cards.push({
        id: `card-${i + 1}`,
        numbers: numbers,
      });
    }
    return cards;
  };

  const handleGameSelect = async (gameId: string) => {
    setSelectedGame(gameId);
    const cards = generateCards();
    setAvailableCards(cards);
    setSelectedCard(null);
  };

  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const joinGame = async () => {
    if (!selectedGame || !selectedCard) {
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

      const selectedCardData = availableCards.find(card => card.id === selectedCard);
      if (!selectedCardData) {
        throw new Error("Cartela não encontrada");
      }

      // Check if player already has a card in this game
      const { data: existingCard } = await supabase
        .from('bingo_cards')
        .select('id')
        .eq('game_id', selectedGame)
        .eq('player_id', session.user.id)
        .single();

      if (existingCard) {
        toast({
          title: "Erro",
          description: "Você já possui uma cartela neste jogo.",
          variant: "destructive"
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('bingo_cards')
        .insert([
          {
            game_id: selectedGame,
            player_id: session.user.id,
            numbers: selectedCardData.numbers,
            marked_numbers: [],
            selected: true
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: "Você entrou no jogo com sucesso.",
      });

      navigate('/player');
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="mb-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
          >
            Voltar para Início
          </Button>
        </div>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">Seleção de Jogo</h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">
                Carregando jogos disponíveis...
              </p>
            ) : games.length > 0 ? (
              <div className="space-y-4">
                {!selectedGame ? (
                  games.map((game) => (
                    <Card key={game.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Jogo #{game.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Criado em: {new Date(game.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Button onClick={() => handleGameSelect(game.id)}>
                          Selecionar
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Escolha sua cartela</h3>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedGame(null);
                          setAvailableCards([]);
                          setSelectedCard(null);
                        }}
                      >
                        Voltar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableCards.map((card) => (
                        <div 
                          key={card.id}
                          className={`cursor-pointer transition-all transform hover:scale-105 ${
                            selectedCard === card.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleCardSelect(card.id)}
                        >
                          <PlayerCard numbers={card.numbers} preview />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        onClick={joinGame}
                        disabled={!selectedCard || joiningGame}
                      >
                        {joiningGame ? 'Entrando...' : 'Confirmar Seleção'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Não há jogos disponíveis no momento. Tente novamente mais tarde.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameSelection;