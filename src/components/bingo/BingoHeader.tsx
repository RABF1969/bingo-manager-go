import React from 'react';

export const BingoHeader = () => {
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-2 sm:mb-4">
      {['B', 'I', 'N', 'G', 'O'].map(letter => (
        <div
          key={letter}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-transparent bg-clip-text p-1 sm:p-2"
        >
          {letter}
        </div>
      ))}
    </div>
  );
};