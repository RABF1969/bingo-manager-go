import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface DashboardStatsProps {
  totalPlayers: number;
}

export const DashboardStats = ({ totalPlayers }: DashboardStatsProps) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
        <Users className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-700">{totalPlayers}</div>
      </CardContent>
    </Card>
  );
};