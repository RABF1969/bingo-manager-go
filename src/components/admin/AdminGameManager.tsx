import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NumberDrawing } from "@/components/NumberDrawing";
import { WinnerDialog } from "@/components/dashboard/WinnerDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { isCardComplete } from "@/utils/winnerUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  name: string;
  email: string;
  phone: string | null;
}

interface Game {
  id: string;
  status: string;
  winner_card_id: string | null;
}

interface AdminGameManagerProps {
  games: Game[];
  onGamesUpdate: () => void;
  onGameSelect: (gameId: string | null) => void;
}

export const AdminGameManager = ({ games, onGamesUpdate, onGameSelect }: AdminGameManagerProps) => {
  const { toast } = useToast();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const currentGame = games.find(game => game.id === currentGameId);

  const handleGameUpdate = async () => {
    if (!currentGameId) return;
    
    await checkGameCompletion(currentGameId);
    await checkForWinner(currentGameId);
  };

  const handleGameSelect = (gameId: string) => {
    setCurrentGameId(gameId);
    onGameSelect(gameId);
  };

  const checkGameCompletion = async (gameId: string) => {
    const { data: drawnNumbers } = await supabase
      .from('drawn_numbers')
      .select('number')
      .eq('game_id', gameId);

    if (!drawnNumbers) return;

    if (drawnNumbers.length === 75) {
      const { error: updateError } = await supabase
        .from('games')
        .update({ 
          status: 'finished',
          finished_at: new Date().toISOString()
        })
        .eq('id', gameId)
        .is('winner_card_id', null);

      if (!updateError) {
        toast({
          title: "Jogo Encerrado",
          description: "Todos os números foram sorteados!",
        });
        onGamesUpdate();
      }
    }
  };

  const checkForWinner = async (gameId: string) => {
    const { data: drawnNumbers } = await supabase
      .from('drawn_numbers')
      .select('number')
      .eq('game_id', gameId);

    if (!drawnNumbers || drawnNumbers.length === 0) return;

    const drawnSet = new Set(drawnNumbers.map(d => d.number));

    const { data: cards } = await supabase
      .from('bingo_cards')
      .select(`
        id,
        numbers,
        player:profiles(id, name, email, phone)
      `)
      .eq('game_id', gameId)
      .eq('selected', true);

    if (!cards) return;

    for (const card of cards) {
      const numbers = card.numbers as number[][];
      
      if (isCardComplete(numbers, drawnSet)) {
        const { error: updateError } = await supabase
          .from('games')
          .update({ 
            winner_card_id: card.id,
            status: 'finished',
            finished_at: new Date().toISOString()
          })
          .eq('id', gameId)
          .is('winner_card_id', null);

        if (!updateError) {
          setWinner(card.player as Player);
          setShowWinnerDialog(true);
          toast({
            title: "BINGO!",
            description: `${card.player.name} completou a cartela!`,
            variant: "default",
          });
          onGamesUpdate();
        }
        break;
      }
    }
  };

  const activeGames = games.filter(game => game.status !== 'finished');

  return (
    <div className="space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg backdrop-blur-sm">
        <Select onValueChange={handleGameSelect} value={currentGameId || undefined}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-700">
            <SelectValue placeholder="Selecione um jogo para iniciar" />
          </SelectTrigger>
          <SelectContent>
            {activeGames.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                Jogo #{game.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-br from-white to-purple-50">
        <CardContent className="pt-6">
          <NumberDrawing 
            gameId={currentGameId}
            onDrawn={handleGameUpdate}
            gameStatus={currentGame?.status}
          />
        </CardContent>
      </Card>

      <WinnerDialog
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        winner={winner}
      />
    </div>
  );
};