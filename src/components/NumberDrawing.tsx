import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DrawnNumber {
  number: number;
  timestamp: Date;
}

interface NumberDrawingProps {
  gameId: string | null;
}

export const NumberDrawing = ({ gameId }: NumberDrawingProps) => {
  const [drawnNumbers, setDrawnNumbers] = useState<DrawnNumber[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const { toast } = useToast();
  const [audio] = useState(() => {
    const sound = new Audio('/number-sound.mp3');
    sound.preload = 'auto';
    return sound;
  });

  useEffect(() => {
    // Preload the audio when component mounts
    audio.load();
  }, [audio]);

  const playNumberSound = async () => {
    try {
      await audio.play();
    } catch (error) {
      console.error('Erro ao tocar o som:', error);
    }
  };

  const drawNumber = async () => {
    if (!gameId) {
      toast({
        title: "Erro",
        description: "Nenhum jogo selecionado para sorteio",
        variant: "destructive",
      });
      return;
    }

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
    
    try {
      const { error } = await supabase
        .from('drawn_numbers')
        .insert([
          {
            game_id: gameId,
            number: newNumber
          }
        ]);

      if (error) throw error;

      setCurrentNumber(newNumber);
      setDrawnNumbers(prev => [...prev, { number: newNumber, timestamp: new Date() }]);
      await playNumberSound();
      
      toast({
        title: "Número Sorteado",
        description: `O número ${newNumber} foi sorteado!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sortear o número",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {currentNumber && (
        <div className="flex justify-center">
          <div className="bingo-ball bg-gradient-to-r from-purple-600 to-pink-600 text-white text-4xl font-bold w-24 h-24 rounded-full flex items-center justify-center animate-bounce shadow-lg">
            {currentNumber}
          </div>
        </div>
      )}

      <Button
        onClick={drawNumber}
        className="w-full px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
        disabled={!gameId}
      >
        {gameId ? "Sortear Próximo Número" : "Selecione um jogo para iniciar"}
      </Button>

      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">Números Sorteados</h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {drawnNumbers.map(({ number }, index) => (
            <div
              key={number}
              className="bingo-ball bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};