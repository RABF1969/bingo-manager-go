// First, let's split the large file into smaller components
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NumberDrawing } from "@/components/NumberDrawing";
import { GamesList } from "@/components/dashboard/GamesList";
import { WinnerDialog } from "@/components/dashboard/WinnerDialog";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminGameManager } from "@/components/admin/AdminGameManager";

interface Player {
  name: string;
  email: string;
  phone: string | null;
}

export const AdminDashboardContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [totalPlayers, setTotalPlayers] = useState(0);

  const { data: games, refetch: refetchGames } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          winner_card:bingo_cards!inner(
            player:profiles(name, email, phone)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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
        
        <DashboardStats totalPlayers={totalPlayers} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdminGameManager games={games || []} onGamesUpdate={refetchGames} />
          <GamesList 
            games={games || []} 
          />
        </div>
      </div>
    </div>
  );
};