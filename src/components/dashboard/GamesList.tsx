import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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
  onGamesUpdate?: () => void;
}

export const GamesList = ({ games, onSelectGame, onGamesUpdate }: GamesListProps) => {
  const { toast } = useToast();
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (gameId: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    if (status === 'finished') {
      toast({
        title: "Ação não permitida",
        description: "Não é possível excluir jogos encerrados.",
        variant: "destructive",
      });
      return;
    }
    setGameToDelete(gameId);
  };

  const handleDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      const { error: deleteCardsError } = await supabase
        .from('bingo_cards')
        .delete()
        .eq('game_id', gameToDelete);

      if (deleteCardsError) throw deleteCardsError;

      const { error: deleteDrawnNumbersError } = await supabase
        .from('drawn_numbers')
        .delete()
        .eq('game_id', gameToDelete);

      if (deleteDrawnNumbersError) throw deleteDrawnNumbersError;

      const { error: deleteGameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameToDelete);

      if (deleteGameError) throw deleteGameError;

      toast({
        title: "Sucesso",
        description: "Jogo excluído com sucesso",
      });

      if (onGamesUpdate) {
        onGamesUpdate();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir jogo",
        description: "Não foi possível excluir o jogo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGameToDelete(null);
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
                  <TableHead className="text-purple-700 dark:text-purple-300 w-[100px]">Ações</TableHead>
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 ${
                          game.status === 'finished' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={(e) => handleDeleteClick(game.id, game.status, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={!!gameToDelete} onOpenChange={() => setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGame}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};