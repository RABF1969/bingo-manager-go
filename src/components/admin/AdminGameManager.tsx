import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NumberDrawing } from "@/components/NumberDrawing";
import { WinnerDialog } from "@/components/dashboard/WinnerDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { isCardComplete } from "@/utils/winnerUtils";

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
}

export const AdminGameManager = ({ games, onGamesUpdate }: AdminGameManagerProps) => {
  const { toast } = useToast();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

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
            title: "Bingo!",
            description: `${card.player.name} completou a cartela!`,
          });
          onGamesUpdate();
        }
        break;
      }
    }
  };

  const handleGameUpdate = () => {
    if (!currentGameId) return;
    checkGameCompletion(currentGameId);
    checkForWinner(currentGameId);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-white to-purple-50">
        <CardContent className="pt-6">
          <NumberDrawing 
            gameId={currentGameId} 
            onNumberDrawn={handleGameUpdate}
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