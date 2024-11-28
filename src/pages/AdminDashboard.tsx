import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NumberDrawing } from "@/components/NumberDrawing";
import { useState, useEffect } from "react";
import { GamesList } from "@/components/dashboard/GamesList";
import { WinnerDialog } from "@/components/dashboard/WinnerDialog";
import { NearWinners } from "@/components/dashboard/NearWinners";
import { GameControls } from "@/components/dashboard/GameControls";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

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

const AdminDashboard = () => {
  const { toast } = useToast();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [nearWinners, setNearWinners] = useState<Array<{
    playerName: string;
    missingNumbers: number[];
  }>>([]);
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
        let hasWon = false;

        // Check rows
        hasWon = hasWon || numbers.some(row => 
          row.every(num => num === 0 || (drawnSet.has(num)))
        );

        // Check columns
        if (!hasWon) {
          for (let col = 0; col < 5; col++) {
            const colNumbers = numbers.map(row => row[col]);
            if (colNumbers.every(num => num === 0 || (drawnSet.has(num)))) {
              hasWon = true;
              break;
            }
          }
        }

        // Check diagonals
        if (!hasWon) {
          const diagonal1 = [numbers[0][0], numbers[1][1], numbers[2][2], numbers[3][3], numbers[4][4]];
          const diagonal2 = [numbers[0][4], numbers[1][3], numbers[2][2], numbers[3][1], numbers[4][0]];
          
          hasWon = hasWon || diagonal1.every(num => num === 0 || (drawnSet.has(num)));
          hasWon = hasWon || diagonal2.every(num => num === 0 || (drawnSet.has(num)));
        }

        if (hasWon) {
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
  }, [currentGameId]);

  const handleCreateGame = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um jogo.",
          variant: "destructive",
        });
        return;
      }

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

  const selectGame = (gameId: string) => {
    setCurrentGameId(gameId);
    toast({
      title: "Jogo Selecionado",
      description: "Você pode começar a sortear os números agora.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <GameControls 
          gameId={currentGameId}
          onCreateGame={handleCreateGame}
        />
        
        <DashboardStats
          totalPlayers={totalPlayers}
          nearWinners={nearWinners}
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
            onSelectGame={selectGame}
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

export default AdminDashboard;