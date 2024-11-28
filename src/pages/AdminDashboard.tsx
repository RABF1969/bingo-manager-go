import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Hash, Clock, Users } from "lucide-react";

interface DrawnNumber {
  number: number;
  drawn_at: string;
}

interface Profile {
  name: string;
}

interface BingoCard {
  player: Profile;
}

interface Game {
  id: string;
  created_at: string;
  status: string;
  finished_at: string | null;
  winner_card_id: string | null;
  winner_card: BingoCard;
  drawn_numbers: DrawnNumber[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: recentGames } = useQuery<Game[]>({
    queryKey: ['recentGames'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          winner_card:bingo_cards!inner(
            player:profiles(name)
          ),
          drawn_numbers (
            number,
            drawn_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: totalPlayers } = useQuery({
    queryKey: ['totalPlayers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count;
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar para Início
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlayers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Número Sorteado</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentGames?.[0]?.drawn_numbers?.[0]?.number || '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentGames?.[0]?.drawn_numbers?.[0]?.drawn_at
                  ? new Date(recentGames[0].drawn_numbers[0].drawn_at).toLocaleString('pt-BR')
                  : 'Nenhum número sorteado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Ganhador</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentGames?.[0]?.winner_card?.player?.name || '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentGames?.[0]?.finished_at
                  ? new Date(recentGames[0].finished_at).toLocaleString('pt-BR')
                  : 'Nenhum ganhador ainda'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogos em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentGames?.filter(game => game.status === 'waiting').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Jogos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGames?.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Jogo #{game.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(game.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {game.status === 'waiting' ? 'Em andamento' : 'Finalizado'}
                      </p>
                      {game.winner_card?.player?.name && (
                        <p className="text-sm text-muted-foreground">
                          Ganhador: {game.winner_card.player.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;