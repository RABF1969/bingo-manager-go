import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GameSelectionList } from '@/components/game-selection/GameSelectionList';
import { CardSelectionView } from '@/components/game-selection/CardSelectionView';

const GameSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

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
                  <GameSelectionList 
                    games={games}
                    onGameSelect={setSelectedGame}
                  />
                ) : (
                  <CardSelectionView
                    gameId={selectedGame}
                    onBack={() => setSelectedGame(null)}
                  />
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