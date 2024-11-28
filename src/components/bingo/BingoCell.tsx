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
        "aspect-square flex items-center justify-center text-lg font-bold rounded-lg shadow-sm transition-all duration-300",
        marked 
          ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white scale-95 transform hover:scale-100" 
          : "bg-white dark:bg-gray-800 hover:bg-violet-100 dark:hover:bg-violet-900 cursor-pointer",
        preview && "cursor-default text-base",
        "border-2 border-transparent hover:border-violet-300 dark:hover:border-violet-700"
      )}
    >
      {number === 0 ? 'LIVRE' : number}
    </div>
  );
};