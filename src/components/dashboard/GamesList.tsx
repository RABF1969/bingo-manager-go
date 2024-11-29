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
        return 'text-red-600 dark:text-red-400';
      case 'waiting':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Últimos Jogos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-purple-100 dark:border-purple-800 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 dark:bg-purple-900/50">
                  <TableHead className="text-purple-700 dark:text-purple-300">Status</TableHead>
                  <TableHead className="text-purple-700 dark:text-purple-300">Criado</TableHead>
                  <TableHead className="text-purple-700 dark:text-purple-300">Ganhador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow 
                    key={game.id}
                    className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors"
                    onClick={() => onSelectGame(game.id)}
                  >
                    <TableCell className={`font-medium ${getStatusColor(game.status)}`}>
                      {getGameStatus(game)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {formatDistanceToNow(new Date(game.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {game.winner_card?.[0]?.player.name || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </>
  );
};