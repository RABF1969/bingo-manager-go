import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NumberDrawing } from "@/components/NumberDrawing";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { GamesList } from "@/components/dashboard/GamesList";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Player {
  name: string;
  email: string;
  phone: string | null;
}

interface WinnerCard {
  player: Player;
}

interface DrawnNumber {
  number: number;
  drawn_at: string;
}

interface Game {
  id: string;
  created_at: string;
  status: string;
  winner_card_id: string | null;
  created_by: string;
  finished_at: string | null;
  winner_card: WinnerCard[];
  drawn_numbers: DrawnNumber[];
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const { data: recentGames, refetch: refetchGames } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          winner_card:bingo_cards!inner(
            player:profiles(name, email, phone)
          ),
          drawn_numbers (
            number,
            drawn_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Game[];
    },
  });

  useEffect(() => {
    const channel = supabase.channel('games')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: 'winner_card_id.is.not.null'
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
  }, []);

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

  const lastDrawnNumber = recentGames?.[0]?.drawn_numbers?.[0];
  const lastWinner = recentGames?.[0]?.winner_card?.[0]?.player?.name;
  const ongoingGames = (recentGames || []).filter(game => game.status === 'waiting').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <DashboardHeader onCreateGame={handleCreateGame} />
        
        <StatCards
          totalPlayers={0}
          lastDrawnNumber={lastDrawnNumber?.number}
          lastDrawnTime={lastDrawnNumber?.drawn_at ? new Date(lastDrawnNumber.drawn_at).toLocaleString('pt-BR') : undefined}
          lastWinner={lastWinner}
          lastWinTime={recentGames?.[0]?.created_at ? new Date(recentGames[0].created_at).toLocaleString('pt-BR') : undefined}
          ongoingGames={ongoingGames}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-white to-purple-50">
            <CardContent className="pt-6">
              <NumberDrawing gameId={currentGameId} />
            </CardContent>
          </Card>

          <GamesList 
            games={recentGames || []} 
            onSelectGame={selectGame}
          />
        </div>

        <AlertDialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
          <AlertDialogContent className="bg-gradient-to-br from-purple-100 to-pink-100">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎉 BINGO! Temos um Vencedor! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center space-y-4 mt-4">
                <p className="text-xl font-semibold text-gray-800">
                  {winner?.name}
                </p>
                <p className="text-gray-600">
                  Email: {winner?.email}
                </p>
                {winner?.phone && (
                  <p className="text-gray-600">
                    Telefone: {winner?.phone}
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Fechar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;