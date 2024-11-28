import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Game {
  id: string;
  status: string;
  created_at: string;
}

const GameSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/player');
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

  const joinGame = async (gameId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/player');
        return;
      }

      // Gerar uma cartela aleatória (5x5)
      const numbers = Array.from({ length: 25 }, (_, i) => i + 1)
        .sort(() => Math.random() - 0.5)
        .reduce((acc, num, idx) => {
          const row = Math.floor(idx / 5);
          if (!acc[row]) acc[row] = [];
          acc[row].push(num);
          return acc;
        }, [] as number[][]);

      const { error } = await supabase
        .from('bingo_cards')
        .insert([
          {
            game_id: gameId,
            player_id: session.user.id,
            numbers: numbers,
            marked_numbers: []
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Você entrou no jogo com sucesso.",
      });

      // Aqui você pode redirecionar para a página do jogo
      // navigate(`/game/${gameId}`);
    } catch (error) {
      toast({
        title: "Erro ao entrar no jogo",
        description: "Não foi possível entrar no jogo selecionado.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
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
                {games.map((game) => (
                  <Card key={game.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Jogo #{game.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Criado em: {new Date(game.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button onClick={() => joinGame(game.id)}>
                        Participar
                      </Button>
                    </div>
                  </Card>
                ))}
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