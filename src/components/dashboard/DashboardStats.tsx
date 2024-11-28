import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface DashboardStatsProps {
  totalPlayers: number;
  nearWinners: Array<{
    playerName: string;
    missingNumbers: number[];
  }>;
}

export const DashboardStats = ({ totalPlayers, nearWinners }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{totalPlayers}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jogadores Próximos de Ganhar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nearWinners.length === 0 ? (
              <p className="text-orange-700">Nenhum jogador próximo de ganhar</p>
            ) : (
              nearWinners.map((winner, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold text-orange-700">{winner.playerName}</span>
                  <span className="text-orange-600"> - Faltam: {winner.missingNumbers.join(', ')}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};