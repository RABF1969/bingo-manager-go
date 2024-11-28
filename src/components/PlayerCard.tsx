import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BingoCell } from './bingo/BingoCell';
import { BingoHeader } from './bingo/BingoHeader';

interface BingoCell {
  number: number;
  marked: boolean;
}

interface PlayerCardProps {
  numbers: number[][];
  preview?: boolean;
  markedNumbers?: number[];
  gameId?: string;
}

export const PlayerCard = ({ numbers: initialNumbers, preview = false, markedNumbers = [], gameId }: PlayerCardProps) => {
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
      
      // Generate 5 unique numbers for each column
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      // Sort numbers in ascending order
      numbers.sort((a, b) => a - b);
      
      // Assign numbers to the column
      for (let row = 0; row < 5; row++) {
        newCard[row][col] = { number: numbers[row], marked: false };
      }
    }

    // Set the center cell as FREE
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

      checkWin();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o número.",
        variant: "destructive"
      });
    }
  };

  const checkWin = () => {
    const hasWinningRow = card.some(row => row.every(cell => cell.marked));
    const hasWinningColumn = Array(5).fill(0).some((_, col) => card.every(row => row[col].marked));
    const hasWinningDiagonal = 
      (card.every((row, i) => row[i].marked) || card.every((row, i) => row[4 - i].marked));

    if (hasWinningRow || hasWinningColumn || hasWinningDiagonal) {
      toast({
        title: "BINGO!",
        description: "Parabéns! Você ganhou!",
        className: "animate-celebrate",
      });
    }
  };

  return (
    <div className={`container mx-auto p-4 ${preview ? 'max-w-sm' : 'max-w-lg'}`}>
      {!preview && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
            Sua Cartela de Bingo
          </h1>
          {!gameId && (
            <Button
              onClick={generateCard}
              variant="outline"
              className="mt-4 hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white transition-all duration-300"
            >
              Nova Cartela
            </Button>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950 rounded-xl shadow-xl p-6 transform hover:scale-[1.02] transition-all duration-300">
        <BingoHeader />
        <div className="grid grid-cols-5 gap-3">
          {card.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <BingoCell
                key={`${rowIndex}-${colIndex}`}
                number={cell.number}
                marked={cell.marked}
                preview={preview}
                onClick={() => toggleMark(rowIndex, colIndex)}
              />
            ))
          ))}
        </div>
      </div>
    </div>
  );
};