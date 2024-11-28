import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NumberDrawing } from "@/components/NumberDrawing";
import { GamesList } from "@/components/dashboard/GamesList";
import { WinnerDialog } from "@/components/dashboard/WinnerDialog";
import { NearWinners } from "@/components/dashboard/NearWinners";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isFullCardComplete } from "@/utils/gameUtils";

interface Player {
  name: string;
  email: string;
  phone: string | null;
}

interface WinnerCard {
  player: Player;
}

interface Game {
  id: string;
  created_at: string;
  status: string;
  winner_card_id: string | null;
  created_by: string;
  finished_at: string | null;
  winner_card: WinnerCard[];
}

export const AdminDashboardContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const { data: recentGames, refetch: refetchGames } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          winner_card:bingo_cards!inner(
            player:profiles(name, email, phone)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Game[];
    },
  });

  useEffect(() => {
    const fetchTotalPlayers = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      setTotalPlayers(count || 0);
    };

    fetchTotalPlayers();
  }, []);

  useEffect(() => {
    if (!currentGameId) return;

    const checkForWinner = async () => {
      const { data: drawnNumbers } = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('game_id', currentGameId);

      const drawnSet = new Set(drawnNumbers?.map(d => d.number) || []);

      const { data: cards } = await supabase
        .from('bingo_cards')
        .select(`
          id,
          numbers,
          marked_numbers,
          player:profiles(id, name, email, phone)
        `)
        .eq('game_id', currentGameId);

      if (!cards) return;

      for (const card of cards) {
        const numbers = card.numbers as number[][];
        const markedNumbers = new Set(card.marked_numbers as number[]);

        if (isFullCardComplete(numbers, markedNumbers, drawnSet)) {
          const { error: updateError } = await supabase
            .from('games')
            .update({ 
              winner_card_id: card.id,
              status: 'finished',
              finished_at: new Date().toISOString()
            })
            .eq('id', currentGameId)
            .is('winner_card_id', null);

          if (!updateError) {
            setWinner(card.player as Player);
            setShowWinnerDialog(true);
            toast({
              title: "Bingo!",
              description: `${card.player.name} completou a cartela!`,
            });
          }
          break;
        }
      }
    };

    const channel = supabase.channel(`game-${currentGameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drawn_numbers',
          filter: `game_id=eq.${currentGameId}`
        },
        () => checkForWinner()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${currentGameId} and winner_card_id.is.not.null`
        },
        async (payload) => {
          const { data: winnerData, error } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('id', payload.new.winner_card_id)
            .single();

          if (!error && winnerData) {
            setWinner(winnerData);
            setShowWinnerDialog(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGameId, toast]);

  const handleCreateGame = async () => {
    const { data: { session } } = await supabase.auth.getSession();
      
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um jogo.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            created_by: session.user.id,
            status: 'waiting'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Novo jogo criado com sucesso.",
      });

      setCurrentGameId(data.id);
      refetchGames();
    } catch (error) {
      toast({
        title: "Erro ao criar jogo",
        description: "Não foi possível criar um novo jogo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar para Início
            </Button>
            <Button 
              onClick={handleCreateGame} 
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Novo Jogo
            </Button>
          </div>
        </div>
        
        <DashboardStats
          totalPlayers={totalPlayers}
          nearWinners={[]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-white to-purple-50">
              <CardContent className="pt-6">
                <NumberDrawing gameId={currentGameId} />
              </CardContent>
            </Card>
            <NearWinners gameId={currentGameId} />
          </div>

          <GamesList 
            games={recentGames || []} 
            onSelectGame={setCurrentGameId}
          />
        </div>

        <WinnerDialog
          open={showWinnerDialog}
          onOpenChange={setShowWinnerDialog}
          winner={winner}
        />
      </div>
    </div>
  );
};
