import React from 'react';

export const BingoHeader = () => {
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {['B', 'I', 'N', 'G', 'O'].map(letter => (
        <div
          key={letter}
          className="text-3xl font-bold text-center text-primary p-2"
        >
          {letter}
        </div>
      ))}
    </div>
  );
};