import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BingoGrid } from './bingo/BingoGrid';
import { checkWinningPattern } from '@/utils/bingoUtils';

interface BingoCell {
  number: number;
  marked: boolean;
}

interface PlayerCardProps {
  numbers: number[][];
  preview?: boolean;
  markedNumbers?: number[];
  gameId?: string;
  cardId?: string;
  isMobile?: boolean;
}

export const PlayerCard = ({ 
  numbers: initialNumbers, 
  preview = false, 
  markedNumbers = [], 
  gameId, 
  cardId,
  isMobile = false
}: PlayerCardProps) => {
  const [card, setCard] = useState<BingoCell[][]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialNumbers) {
      setCard(initialNumbers.map(row => 
        row.map(number => ({ 
          number, 
          marked: number === 0 || markedNumbers.includes(number)
        }))
      ));
    } else {
      generateCard();
    }
  }, [initialNumbers, markedNumbers]);

  const generateCard = () => {
    // Initialize empty card
    const newCard: BingoCell[][] = Array(5).fill(null).map(() => Array(5).fill({ number: 0, marked: false }));
    
    // Define ranges for each column (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
    const columnRanges = [
      { min: 1, max: 15 },
      { min: 16, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 75 }
    ];

    // Generate numbers for each column
    for (let col = 0; col < 5; col++) {
      const { min, max } = columnRanges[col];
      const numbers = [];
      
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      numbers.sort((a, b) => a - b);
      
      for (let row = 0; row < 5; row++) {
        newCard[row][col] = { number: numbers[row], marked: false };
      }
    }

    newCard[2][2] = { number: 0, marked: true };
    setCard(newCard);
  };

  const toggleMark = async (rowIndex: number, colIndex: number) => {
    if (preview || (rowIndex === 2 && colIndex === 2)) return;

    const number = card[rowIndex][colIndex].number;
    const isMarked = card[rowIndex][colIndex].marked;

    if (!gameId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if the number has been drawn
      const { data: gameData, error: gameError } = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('game_id', gameId)
        .eq('number', number)
        .single();

      if (gameError || !gameData) {
        toast({
          title: "Número não sorteado",
          description: "Este número ainda não foi sorteado!",
          variant: "destructive"
        });
        return;
      }

      // Update marked numbers in the database
      const { data: cardData, error: cardError } = await supabase
        .from('bingo_cards')
        .select('marked_numbers')
        .eq('game_id', gameId)
        .eq('player_id', session.user.id)
        .single();

      if (cardError || !cardData) return;

      const newMarkedNumbers = isMarked
        ? (cardData.marked_numbers as number[]).filter(n => n !== number)
        : [...(cardData.marked_numbers as number[]), number];

      const { error: updateError } = await supabase
        .from('bingo_cards')
        .update({ marked_numbers: newMarkedNumbers })
        .eq('game_id', gameId)
        .eq('player_id', session.user.id);

      if (updateError) throw updateError;

      setCard(prev => {
        const newCard = [...prev];
        newCard[rowIndex] = [...newCard[rowIndex]];
        newCard[rowIndex][colIndex] = {
          ...newCard[rowIndex][colIndex],
          marked: !isMarked,
        };
        return newCard;
      });

      // Após marcar o número, verifica se ganhou
      const { data: drawnNumbers } = await supabase
        .from('drawn_numbers')
        .select('number')
        .eq('game_id', gameId);

      if (drawnNumbers) {
        const drawnSet = new Set(drawnNumbers.map(d => d.number));
        if (checkWinningPattern(card, drawnSet)) {
          toast({
            title: "BINGO!",
            description: "Parabéns! Você ganhou!",
            className: "animate-celebrate",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o número.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`container mx-auto p-2 sm:p-4 ${preview ? 'max-w-[280px] sm:max-w-sm' : 'max-w-sm sm:max-w-md md:max-w-xl'}`}>
      {!preview && (
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
            Sua Cartela de Bingo
          </h1>
          {cardId && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Cartela #{cardId.slice(0, 8)}
            </p>
          )}
          {!gameId && (
            <Button
              onClick={generateCard}
              variant="outline"
              className="mt-2 sm:mt-4 hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white transition-all duration-300"
            >
              Nova Cartela
            </Button>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950 rounded-xl shadow-xl p-3 sm:p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-300">
        {preview && cardId && (
          <div className="text-center mb-2 sm:mb-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Cartela #{cardId.slice(0, 8)}
            </span>
          </div>
        )}
        <BingoGrid 
          card={card}
          preview={preview}
          onCellClick={toggleMark}
        />
      </div>
    </div>
  );
};