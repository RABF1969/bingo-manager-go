import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { findNearWinners } from '@/utils/gameUtils';
import { Trophy } from "lucide-react";

interface NearWinner {
  playerName: string;
  missingNumbers: number[];
}

interface BingoCard {
  numbers: number[][];
  marked_numbers: number[];
  player: {
    name: string;
  };
}

export const NearWinners = ({ gameId }: { gameId: string | null }) => {
  const [nearWinners, setNearWinners] = useState<NearWinner[]>([]);

  useEffect(() => {
    if (!gameId) return;

    const checkNearWinners = async () => {
      const { data: drawnNumbers } = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('game_id', gameId);

      const drawnSet = new Set(drawnNumbers?.map(d => d.number) || []);

      const { data: cards } = await supabase
        .from('bingo_cards')
        .select(`
          numbers,
          marked_numbers,
          player:profiles(name)
        `)
        .eq('game_id', gameId)
        .eq('selected', true);

      if (!cards) return;

      const typedCards: BingoCard[] = cards.map(card => ({
        numbers: card.numbers as number[][],
        marked_numbers: card.marked_numbers as number[],
        player: card.player as { name: string }
      }));

      const newNearWinners = findNearWinners(typedCards, drawnSet);
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
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Jogadores Próximos de Ganhar
        </CardTitle>
        <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nearWinners.map((winner, index) => (
            <div key={index} className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">{winner.playerName}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Faltam marcar: {winner.missingNumbers.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};