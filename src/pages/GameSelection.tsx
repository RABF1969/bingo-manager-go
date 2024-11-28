import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PlayerCard } from "@/components/PlayerCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    for (let i = 0; i < 5; i++) { // Increased from 3 to 5 cards
      const numbers: number[][] = Array(5).fill(null).map(() => Array(5).fill(0));
      
      // Define column ranges (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
      const ranges = [
        { min: 1, max: 15 },
        { min: 16, max: 30 },
        { min: 31, max: 45 },
        { min: 46, max: 60 },
        { min: 61, max: 75 }
      ];

      // Generate numbers for each column
      for (let col = 0; col < 5; col++) {
        const { min, max } = ranges[col];
        const columnNumbers = [];
        
        // Generate 5 unique numbers for each column
        while (columnNumbers.length < 5) {
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!columnNumbers.includes(num)) {
            columnNumbers.push(num);
          }
        }
        
        // Sort numbers in ascending order
        columnNumbers.sort((a, b) => a - b);
        
        // Assign sorted numbers to the column
        for (let row = 0; row < 5; row++) {
          numbers[row][col] = columnNumbers[row];
        }
      }

      // Set center as FREE
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
    
    // Check if player already has a card for this game
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/player');
      return;
    }

    const { data: existingCard } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', session.user.id)
      .single();

    if (existingCard) {
      // If player already has a card, navigate to the player view
      toast({
        title: "Cartela encontrada",
        description: "Você já possui uma cartela neste jogo. Redirecionando para sua cartela...",
      });
      navigate('/player', { state: { gameId } });
      return;
    }

    // If no existing card, generate new cards for selection
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

      navigate('/player', { state: { gameId: selectedGame } });
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
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="hover:bg-primary/10"
          >
            Voltar para Início
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
              Seleção de Jogo
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">
                Carregando jogos disponíveis...
              </p>
            ) : games.length > 0 ? (
              <div className="space-y-6">
                {!selectedGame ? (
                  <div className="grid gap-4">
                    {games.map((game) => (
                      <Card key={game.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-lg">Jogo #{game.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Criado em: {new Date(game.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button 
                            onClick={() => handleGameSelect(game.id)}
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                          >
                            Selecionar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
                        Escolha sua cartela
                      </h3>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedGame(null);
                          setAvailableCards([]);
                          setSelectedCard(null);
                        }}
                        className="hover:bg-primary/10"
                      >
                        Voltar
                      </Button>
                    </div>
                    
                    <div className="relative px-12">
                      <Carousel className="w-full max-w-3xl mx-auto">
                        <CarouselContent>
                          {availableCards.map((card) => (
                            <CarouselItem key={card.id}>
                              <div 
                                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 p-4 rounded-xl ${
                                  selectedCard === card.id ? 'ring-4 ring-violet-500/50' : ''
                                }`}
                                onClick={() => handleCardSelect(card.id)}
                              >
                                <PlayerCard numbers={card.numbers} preview />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>

                    <div className="flex justify-center pt-6">
                      <Button 
                        onClick={joinGame}
                        disabled={!selectedCard || joiningGame}
                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 px-8 py-2 text-lg"
                      >
                        {joiningGame ? 'Entrando...' : 'Confirmar Seleção'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-lg">
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