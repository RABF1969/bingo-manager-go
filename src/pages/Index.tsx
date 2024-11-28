import { useState } from 'react';
import { AdminDashboard } from "@/components/AdminDashboard";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [mode, setMode] = useState<'admin' | 'player' | null>(null);

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Virtual Bingo</h1>
          <p className="text-xl text-muted-foreground mb-8">Choose your role to begin</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setMode('admin')}
            className="px-8 py-6 text-lg"
            variant="outline"
          >
            Game Master
          </Button>
          <Button
            onClick={() => setMode('player')}
            className="px-8 py-6 text-lg"
            variant="default"
          >
            Player
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <Button
          onClick={() => setMode(null)}
          variant="ghost"
          className="mb-4"
        >
          Back to Role Selection
        </Button>
      </div>
      {mode === 'admin' ? <AdminDashboard /> : <PlayerCard />}
    </div>
  );
};

export default Index;