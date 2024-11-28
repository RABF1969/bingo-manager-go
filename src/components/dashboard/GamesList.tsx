import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Player {
  name: string;
}

interface WinnerCard {
  player: Player;
}

interface Game extends Tables<'games'> {
  winner_card: WinnerCard[];
}

interface GamesListProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
}

export const GamesList = ({ games, onSelectGame }: GamesListProps) => {
  const getStatusBadge = (status: string, winnerCardId: string | null, finishedAt: string | null) => {
    if (winnerCardId || status === 'finished' || finishedAt) {
      return (
        <Badge variant="destructive" className="bg-red-500">
          Encerrado
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-500 text-white">
        Em andamento
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-800">Últimos Jogos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Jogo</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ganhador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow
                  key={game.id}
                  className="cursor-pointer hover:bg-purple-50/50 transition-colors"
                  onClick={() => onSelectGame(game.id)}
                >
                  <TableCell className="font-medium text-purple-700">
                    #{game.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {new Date(game.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(game.status, game.winner_card_id, game.finished_at)}
                  </TableCell>
                  <TableCell>
                    {game.winner_card?.[0]?.player?.name || '-'}
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