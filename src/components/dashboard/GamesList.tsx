import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  name: string;
}

interface WinnerCard {
  player: Player;
}

interface Game {
  id: string;
  created_at: string;
  status: string;
  winner_card: WinnerCard[];
}

interface GamesListProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
}

export const GamesList = ({ games, onSelectGame }: GamesListProps) => {
  const getStatusBadge = (status: string, hasWinner: boolean) => {
    if (hasWinner || status === 'finished') {
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
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50/50 cursor-pointer transition-colors"
              onClick={() => onSelectGame(game.id)}
            >
              <div>
                <p className="font-medium text-purple-700">
                  Jogo #{game.id.slice(0, 8)}
                </p>
                <p className="text-sm text-purple-600/80">
                  Criado em: {new Date(game.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                {getStatusBadge(game.status, !!game.winner_card?.[0])}
                {game.winner_card?.[0]?.player?.name && (
                  <p className="text-sm text-pink-600/80">
                    Ganhador: {game.winner_card[0].player.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};