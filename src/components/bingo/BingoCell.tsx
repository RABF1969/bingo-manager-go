import React from 'react';
import { cn } from "@/lib/utils";

interface BingoCellProps {
  number: number;
  marked: boolean;
  onClick: () => void;
  preview?: boolean;
}

export const BingoCell = ({ number, marked, onClick, preview }: BingoCellProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "aspect-square flex items-center justify-center text-lg font-bold rounded-lg shadow-sm transition-all duration-200",
        marked 
          ? "bg-primary text-primary-foreground scale-95" 
          : "bg-card hover:bg-accent cursor-pointer",
        preview && "cursor-default text-base",
      )}
    >
      {number === 0 ? 'LIVRE' : number}
    </div>
  );
};