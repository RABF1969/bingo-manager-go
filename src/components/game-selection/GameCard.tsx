import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  id: string;
  createdAt: string;
  status: string;
  onSelect: (gameId: string) => void;
}

export const GameCard = ({ id, createdAt, status, onSelect }: GameCardProps) => {
  const isGameActive = status === 'waiting';

  const getStatusBadge = () => {
    if (status === 'finished') {
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
    <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="font-medium text-base md:text-lg">Jogo #{id.slice(0, 8)}</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Criado em: {new Date(createdAt).toLocaleString('pt-BR')}
          </p>
          <div className="mt-2">
            {getStatusBadge()}
          </div>
        </div>
        <Button 
          onClick={() => onSelect(id)}
          className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          disabled={!isGameActive}
        >
          {isGameActive ? 'Selecionar' : 'Jogo Encerrado'}
        </Button>
      </div>
    </Card>
  );
};