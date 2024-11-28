import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Game {
  id: string;
  created_at: string;
  status: string;
  winner_card?: {
    player: {
      name: string;
    };
  };
}

interface GamesListProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
}

export const GamesList = ({ games, onSelectGame }: GamesListProps) => {
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
              <div className="text-right">
                <p className="font-medium text-pink-600">
                  {game.status === 'waiting' ? 'Em andamento' : 'Finalizado'}
                </p>
                {game.winner_card?.player?.name && (
                  <p className="text-sm text-pink-600/80">
                    Ganhador: {game.winner_card.player.name}
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