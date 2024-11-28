import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DrawnNumber {
  number: number;
  timestamp: Date;
}

export const AdminDashboard = () => {
  const [drawnNumbers, setDrawnNumbers] = useState<DrawnNumber[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const { toast } = useToast();

  const drawNumber = () => {
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1)
      .filter(num => !drawnNumbers.some(drawn => drawn.number === num));

    if (availableNumbers.length === 0) {
      toast({
        title: "Fim de Jogo",
        description: "Todos os números foram sorteados!",
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];
    
    setCurrentNumber(newNumber);
    setDrawnNumbers(prev => [...prev, { number: newNumber, timestamp: new Date() }]);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Painel do Bingo</h1>
        <p className="text-muted-foreground">Sorteie números e gerencie o jogo</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {currentNumber && (
          <div className="bingo-ball bg-primary text-primary-foreground">
            {currentNumber}
          </div>
        )}

        <Button
          onClick={drawNumber}
          className="px-8 py-6 text-lg"
          variant="outline"
        >
          Sortear Próximo Número
        </Button>

        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Números Sorteados</h2>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {drawnNumbers.map(({ number }, index) => (
              <div
                key={number}
                className="bingo-ball bg-secondary text-secondary-foreground"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};