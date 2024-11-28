import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface NearWinner {
  playerName: string;
  missingNumbers: number[];
}

export const NearWinners = ({ gameId }: { gameId: string | null }) => {
  const [nearWinners, setNearWinners] = useState<NearWinner[]>([]);

  useEffect(() => {
    if (!gameId) return;

    const checkNearWinners = async () => {
      // Get all drawn numbers for this game
      const { data: drawnNumbers } = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('game_id', gameId);

      const drawnSet = new Set(drawnNumbers?.map(d => d.number) || []);

      // Get all cards for this game
      const { data: cards } = await supabase
        .from('bingo_cards')
        .select(`
          numbers,
          marked_numbers,
          player:profiles(name)
        `)
        .eq('game_id', gameId);

      if (!cards) return;

      const newNearWinners = cards.reduce<NearWinner[]>((acc, card) => {
        const numbers = card.numbers as number[][];
        const markedNumbers = new Set(card.marked_numbers as number[]);
        
        // Check rows
        for (let row = 0; row < 5; row++) {
          const missing = numbers[row].filter(num => 
            !markedNumbers.has(num) && drawnSet.has(num)
          );
          if (missing.length <= 3 && missing.length > 0) {
            acc.push({
              playerName: (card.player as any).name,
              missingNumbers: missing
            });
            return acc;
          }
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
          const colNumbers = numbers.map(row => row[col]);
          const missing = colNumbers.filter(num => 
            !markedNumbers.has(num) && drawnSet.has(num)
          );
          if (missing.length <= 3 && missing.length > 0) {
            acc.push({
              playerName: (card.player as any).name,
              missingNumbers: missing
            });
            return acc;
          }
        }

        // Check diagonals
        const diagonal1 = [numbers[0][0], numbers[1][1], numbers[2][2], numbers[3][3], numbers[4][4]];
        const diagonal2 = [numbers[0][4], numbers[1][3], numbers[2][2], numbers[3][1], numbers[4][0]];
        
        [diagonal1, diagonal2].forEach(diagonal => {
          const missing = diagonal.filter(num => 
            !markedNumbers.has(num) && drawnSet.has(num)
          );
          if (missing.length <= 3 && missing.length > 0) {
            acc.push({
              playerName: (card.player as any).name,
              missingNumbers: missing
            });
          }
        });

        return acc;
      }, []);

      setNearWinners(newNearWinners);
    };

    const channel = supabase.channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drawn_numbers',
          filter: `game_id=eq.${gameId}`
        },
        () => checkNearWinners()
      )
      .subscribe();

    checkNearWinners();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  if (!gameId || nearWinners.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-yellow-800">
          Jogadores Próximos de Ganhar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nearWinners.map((winner, index) => (
            <div key={index} className="p-4 bg-white/50 rounded-lg">
              <p className="font-semibold text-yellow-900">{winner.playerName}</p>
              <p className="text-sm text-yellow-700">
                Faltam marcar: {winner.missingNumbers.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};