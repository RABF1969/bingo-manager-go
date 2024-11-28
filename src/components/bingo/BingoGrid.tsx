import React from 'react';
import { BingoCell } from './BingoCell';
import { BingoHeader } from './BingoHeader';

interface BingoGridProps {
  card: Array<Array<{ number: number; marked: boolean }>>;
  preview?: boolean;
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

export const BingoGrid: React.FC<BingoGridProps> = ({ 
  card, 
  preview = false, 
  onCellClick 
}) => {
  return (
    <>
      <BingoHeader />
      <div className="grid grid-cols-5 gap-4">
        {card.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <BingoCell
              key={`${rowIndex}-${colIndex}`}
              number={cell.number}
              marked={cell.marked}
              preview={preview}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          ))
        ))}
      </div>
    </>
  );
};