import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { NearWinners } from "./NearWinners";

interface DashboardStatsProps {
  totalPlayers: number;
  gameId: string | null;
}

export const DashboardStats = ({ totalPlayers, gameId }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Total de Jogadores
          </CardTitle>
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {totalPlayers}
          </div>
        </CardContent>
      </Card>

      {gameId && (
        <Card className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 dark:from-pink-500/20 dark:to-orange-500/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-none">
          <NearWinners gameId={gameId} />
        </Card>
      )}
    </div>
  );
};