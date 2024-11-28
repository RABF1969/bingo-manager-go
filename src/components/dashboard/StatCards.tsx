import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Hash, Clock, Users } from "lucide-react";

interface StatCardsProps {
  totalPlayers: number;
  lastDrawnNumber?: number;
  lastDrawnTime?: string;
  lastWinner?: string;
  lastWinTime?: string;
  ongoingGames: number;
}

export const StatCards = ({
  totalPlayers,
  lastDrawnNumber,
  lastDrawnTime,
  lastWinner,
  lastWinTime,
  ongoingGames,
}: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{totalPlayers || 0}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-red-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Último Número Sorteado</CardTitle>
          <Hash className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-700">
            {lastDrawnNumber || '-'}
          </div>
          <p className="text-xs text-pink-600/80">
            {lastDrawnTime || 'Nenhum número sorteado'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Último Ganhador</CardTitle>
          <Trophy className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            {lastWinner || '-'}
          </div>
          <p className="text-xs text-orange-600/80">
            {lastWinTime || 'Nenhum ganhador ainda'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jogos em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{ongoingGames}</div>
        </CardContent>
      </Card>
    </div>
  );
};