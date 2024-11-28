import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Game {
  id: string;
  status: string;
  created_at: string;
  finished_at: string | null;
  winner_card: {
    player: {
      name: string;
      email: string;
      phone: string | null;
    };
  }[];
}

interface GamesListProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
}

export const GamesList = ({ games, onSelectGame }: GamesListProps) => {
  const getGameStatus = (game: Game) => {
    if (game.status === 'finished') return 'Encerrado';
    if (game.status === 'waiting') return 'Aguardando';
    return 'Em andamento';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
        return 'text-red-600';
      case 'waiting':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Jogos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Ganhador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow 
                  key={game.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectGame(game.id)}
                >
                  <TableCell className={getStatusColor(game.status)}>
                    {getGameStatus(game)}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(game.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {game.winner_card?.[0]?.player.name || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};