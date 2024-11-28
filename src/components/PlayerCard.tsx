import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface BingoCell {
  number: number;
  marked: boolean;
}

interface PlayerCardProps {
  numbers?: number[][];
  preview?: boolean;
}

export const PlayerCard = ({ numbers: initialNumbers, preview = false }: PlayerCardProps) => {
  const [card, setCard] = useState<BingoCell[][]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialNumbers) {
      setCard(initialNumbers.map(row => 
        row.map(number => ({ number, marked: number === 0 }))
      ));
    } else {
      generateCard();
    }
  }, [initialNumbers]);

  const generateCard = () => {
    const newCard: BingoCell[][] = [];
    const usedNumbers = new Set<number>();

    for (let i = 0; i < 5; i++) {
      const row: BingoCell[] = [];
      const min = i * 15 + 1;
      const max = min + 14;

      for (let j = 0; j < 5; j++) {
        let number;
        do {
          number = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(number));

        usedNumbers.add(number);
        row.push({ number, marked: false });
      }
      newCard.push(row);
    }

    // Make center cell free
    newCard[2][2] = { number: 0, marked: true };
    setCard(newCard);
  };

  const toggleMark = (rowIndex: number, colIndex: number) => {
    if (preview || rowIndex === 2 && colIndex === 2) return; // Free space or preview mode

    setCard(prev => {
      const newCard = [...prev];
      newCard[rowIndex] = [...newCard[rowIndex]];
      newCard[rowIndex][colIndex] = {
        ...newCard[rowIndex][colIndex],
        marked: !newCard[rowIndex][colIndex].marked,
      };
      return newCard;
    });

    checkWin();
  };

  const checkWin = () => {
    // Check rows
    const hasWinningRow = card.some(row => 
      row.every(cell => cell.marked)
    );

    // Check columns
    const hasWinningColumn = Array(5).fill(0).some((_, col) =>
      card.every(row => row[col].marked)
    );

    // Check diagonals
    const hasWinningDiagonal = 
      (card.every((row, i) => row[i].marked) || // Main diagonal
       card.every((row, i) => row[4 - i].marked)); // Other diagonal

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
          <h1 className="text-4xl font-bold mb-2">Sua Cartela de Bingo</h1>
          <Button
            onClick={generateCard}
            variant="outline"
            className="mt-4"
          >
            Nova Cartela
          </Button>
        </div>
      )}

      <div className="grid gap-2 bg-card p-4 rounded-xl shadow-lg">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {['B', 'I', 'N', 'G', 'O'].map(letter => (
            <div
              key={letter}
              className="text-2xl font-bold text-center text-primary"
            >
              {letter}
            </div>
          ))}
        </div>

        {card.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`bingo-cell ${cell.marked ? 'marked' : ''} ${preview ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => toggleMark(rowIndex, colIndex)}
              >
                {cell.number === 0 ? 'LIVRE' : cell.number}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};