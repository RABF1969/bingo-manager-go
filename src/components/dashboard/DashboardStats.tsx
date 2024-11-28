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
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{totalPlayers}</div>
        </CardContent>
      </Card>

      <NearWinners gameId={gameId} />
    </div>
  );
};