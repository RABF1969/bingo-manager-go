import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamesList } from '@/components/dashboard/GamesList';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdminGameManager } from '@/components/admin/AdminGameManager';
import { CreateGameDialog } from '@/components/admin/CreateGameDialog';
import { useIsMobile } from "@/hooks/use-mobile";

export const AdminDashboardContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          // Force a refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['games'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: games, refetch: refetchGames } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Modificado para buscar todos os jogos sem filtros adicionais
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          winner_card:bingo_cards(
            player:profiles(name, email, phone)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar jogos",
          description: "Não foi possível carregar a lista de jogos.",
          variant: "destructive"
        });
        throw error;
      }

      const gamesWithCreatorFlag = data?.map(game => ({
        ...game,
        isCreator: session?.user.id === game.created_by
      })) || [];

      return gamesWithCreatorFlag;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data always stale
    gcTime: 0, // Don't cache the data (previously cacheTime)
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

      // Force immediate data update
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await refetchGames();
      
      // Update cache immediately
      queryClient.setQueryData(['games'], (oldData: any) => {
        if (!oldData || !data) return oldData;
        const newGame = { ...data, isCreator: true };
        return Array.isArray(oldData) ? [newGame, ...oldData] : [newGame];
      });
    } catch (error) {
      toast({
        title: "Erro ao criar jogo",
        description: "Não foi possível criar um novo jogo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/50 dark:bg-gray-800/50 p-4 md:p-6 rounded-xl backdrop-blur-sm shadow-lg">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center md:text-left">
            Painel Administrativo
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="bg-white/80 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 w-full sm:w-auto"
            >
              Voltar para Início
            </Button>
            <CreateGameDialog onCreateGame={handleCreateGame} />
          </div>
        </div>
        
        <DashboardStats totalPlayers={totalPlayers} gameId={selectedGameId} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-4 md:space-y-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-none overflow-hidden">
              <AdminGameManager 
                games={games || []} 
                onGamesUpdate={refetchGames} 
                onGameSelect={setSelectedGameId}
              />
            </Card>
          </div>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-none overflow-hidden">
            <GamesList 
              games={games || []} 
              onSelectGame={setSelectedGameId}
              onGamesUpdate={refetchGames}
              isMobile={isMobile}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
